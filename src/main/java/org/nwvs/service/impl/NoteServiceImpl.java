package org.nwvs.service.impl;

import org.nwvs.dto.DashboardResponse;
import org.nwvs.dto.NoteRequest;
import org.nwvs.dto.NoteResponse;
import org.nwvs.entity.Category;
import org.nwvs.entity.Note;
import org.nwvs.entity.User;
import org.nwvs.exception.ResourceNotFoundException;
import org.nwvs.repository.NoteRepository;
import org.nwvs.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NoteServiceImpl implements NoteService {

    @Autowired
    private NoteRepository noteRepository;

    private NoteResponse mapToResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .voiceTranscript(note.getVoiceTranscript())
                .category(note.getCategory())
                .color(note.getColor())
                .pinned(note.isPinned())
                .archived(note.isArchived())
                .favorite(note.isFavorite())
                .createdDate(note.getCreatedDate())
                .updatedDate(note.getUpdatedDate())
                .build();
    }

    @Override
    @Transactional
    public NoteResponse createNote(NoteRequest request, User currentUser) {
        Note note = Note.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .voiceTranscript(request.getVoiceTranscript())
                .category(request.getCategory())
                .color(request.getColor())
                .pinned(Boolean.TRUE.equals(request.getPinned()))
                .archived(Boolean.TRUE.equals(request.getArchived()))
                .favorite(Boolean.TRUE.equals(request.getFavorite()))
                .user(currentUser)
                .build();

        Note savedNote = noteRepository.save(note);
        return mapToResponse(savedNote);
    }

    @Override
    @Transactional
    public NoteResponse updateNote(Long id, NoteRequest request, User currentUser) {
        Note note = noteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setVoiceTranscript(request.getVoiceTranscript());
        if (request.getCategory() != null) {
            note.setCategory(request.getCategory());
        }
        if (request.getColor() != null) {
            note.setColor(request.getColor());
        }
        note.setPinned(Boolean.TRUE.equals(request.getPinned()));
        note.setArchived(Boolean.TRUE.equals(request.getArchived()));
        note.setFavorite(Boolean.TRUE.equals(request.getFavorite()));

        Note updatedNote = noteRepository.save(note);
        return mapToResponse(updatedNote);
    }

    @Override
    @Transactional
    public void deleteNote(Long id, User currentUser) {
        Note note = noteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
        noteRepository.delete(note);
    }

    @Override
    @Transactional(readOnly = true)
    public NoteResponse getNote(Long id, User currentUser) {
        Note note = noteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
        return mapToResponse(note);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NoteResponse> getAllNotes(User currentUser, String search, Category category, Boolean pinned, Boolean archived, Boolean favorite, Pageable pageable) {
        // Clean filters
        String cleanedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        Page<Note> notesPage = noteRepository.findAllFiltered(currentUser, cleanedSearch, category, pinned, archived, favorite, pageable);
        return notesPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public NoteResponse togglePin(Long id, User currentUser) {
        Note note = noteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
        note.setPinned(!note.isPinned());
        // If pinned, we un-archive it automatically
        if (note.isPinned()) {
            note.setArchived(false);
        }
        return mapToResponse(noteRepository.save(note));
    }

    @Override
    @Transactional
    public NoteResponse toggleArchive(Long id, User currentUser) {
        Note note = noteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
        note.setArchived(!note.isArchived());
        // If archived, we un-pin it automatically
        if (note.isArchived()) {
            note.setPinned(false);
        }
        return mapToResponse(noteRepository.save(note));
    }

    @Override
    @Transactional
    public NoteResponse toggleFavorite(Long id, User currentUser) {
        Note note = noteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
        note.setFavorite(!note.isFavorite());
        return mapToResponse(noteRepository.save(note));
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardData(User currentUser) {
        long totalNotes = noteRepository.countByUserAndArchivedFalse(currentUser);
        long pinnedNotes = noteRepository.countByUserAndPinnedTrueAndArchivedFalse(currentUser);
        long favoriteNotes = noteRepository.countByUserAndFavoriteTrueAndArchivedFalse(currentUser);
        long archivedNotes = noteRepository.countByUserAndArchivedTrue(currentUser);

        List<Note> latestRaw = noteRepository.findTop5ByUserAndArchivedFalseOrderByCreatedDateDesc(currentUser);
        List<NoteResponse> latestNotes = latestRaw.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // Initialize empty statistics map for all categories
        Map<Category, Long> categoryStats = new EnumMap<>(Category.class);
        for (Category category : Category.values()) {
            categoryStats.put(category, 0L);
        }

        // Fill with actual counts
        List<Object[]> rawStats = noteRepository.countNotesByCategory(currentUser);
        for (Object[] row : rawStats) {
            Category category = (Category) row[0];
            Long count = (Long) row[1];
            if (category != null) {
                categoryStats.put(category, count);
            }
        }

        return DashboardResponse.builder()
                .totalNotes(totalNotes)
                .pinnedNotes(pinnedNotes)
                .favoriteNotes(favoriteNotes)
                .archivedNotes(archivedNotes)
                .latestNotes(latestNotes)
                .categoryStats(categoryStats)
                .build();
    }
}
