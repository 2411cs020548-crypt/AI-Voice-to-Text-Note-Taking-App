package org.nwvs.service;

import org.nwvs.dto.DashboardResponse;
import org.nwvs.dto.NoteRequest;
import org.nwvs.dto.NoteResponse;
import org.nwvs.entity.Category;
import org.nwvs.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NoteService {
    NoteResponse createNote(NoteRequest request, User currentUser);
    NoteResponse updateNote(Long id, NoteRequest request, User currentUser);
    void deleteNote(Long id, User currentUser);
    NoteResponse getNote(Long id, User currentUser);
    Page<NoteResponse> getAllNotes(User currentUser, String search, Category category, Boolean pinned, Boolean archived, Boolean favorite, Pageable pageable);
    NoteResponse togglePin(Long id, User currentUser);
    NoteResponse toggleArchive(Long id, User currentUser);
    NoteResponse toggleFavorite(Long id, User currentUser);
    DashboardResponse getDashboardData(User currentUser);
}
