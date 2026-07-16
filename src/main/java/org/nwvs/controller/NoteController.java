package org.nwvs.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.nwvs.dto.ApiResponse;
import org.nwvs.dto.DashboardResponse;
import org.nwvs.dto.NoteRequest;
import org.nwvs.dto.NoteResponse;
import org.nwvs.entity.Category;
import org.nwvs.security.UserPrincipal;
import org.nwvs.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notes")
@Tag(name = "Notes", description = "Note Management APIs")
public class NoteController {

    @Autowired
    private NoteService noteService;

    private Pageable createPageable(int page, int size, String sortBy, String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    @GetMapping
    @Operation(summary = "Get all notes with optional search, filters, pagination, and sorting")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> getNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Boolean pinned,
            @RequestParam(required = false) Boolean archived,
            @RequestParam(required = false) Boolean favorite,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        
        Pageable pageable = createPageable(page, size, sortBy, order);
        Page<NoteResponse> notes = noteService.getAllNotes(principal.getUser(), search, category, pinned, archived, favorite, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<NoteResponse>>builder()
                .success(true)
                .message("Notes retrieved successfully")
                .data(notes)
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get note by ID")
    public ResponseEntity<ApiResponse<NoteResponse>> getNoteById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        NoteResponse note = noteService.getNote(id, principal.getUser());
        return ResponseEntity.ok(ApiResponse.<NoteResponse>builder()
                .success(true)
                .message("Note retrieved successfully")
                .data(note)
                .build());
    }

    @PostMapping
    @Operation(summary = "Create a new note")
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse note = noteService.createNote(request, principal.getUser());
        return new ResponseEntity<>(ApiResponse.<NoteResponse>builder()
                .success(true)
                .message("Note created successfully")
                .data(note)
                .build(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing note")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse note = noteService.updateNote(id, request, principal.getUser());
        return ResponseEntity.ok(ApiResponse.<NoteResponse>builder()
                .success(true)
                .message("Note updated successfully")
                .data(note)
                .build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete note by ID")
    public ResponseEntity<ApiResponse<Object>> deleteNote(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        noteService.deleteNote(id, principal.getUser());
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Note deleted successfully")
                .data(null)
                .build());
    }

    @PutMapping("/pin/{id}")
    @Operation(summary = "Toggle pin status of a note")
    public ResponseEntity<ApiResponse<NoteResponse>> togglePin(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        NoteResponse note = noteService.togglePin(id, principal.getUser());
        return ResponseEntity.ok(ApiResponse.<NoteResponse>builder()
                .success(true)
                .message(note.isPinned() ? "Note pinned successfully" : "Note unpinned successfully")
                .data(note)
                .build());
    }

    @PutMapping("/archive/{id}")
    @Operation(summary = "Toggle archive status of a note")
    public ResponseEntity<ApiResponse<NoteResponse>> toggleArchive(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        NoteResponse note = noteService.toggleArchive(id, principal.getUser());
        return ResponseEntity.ok(ApiResponse.<NoteResponse>builder()
                .success(true)
                .message(note.isArchived() ? "Note archived successfully" : "Note restored from archive successfully")
                .data(note)
                .build());
    }

    @PutMapping("/favorite/{id}")
    @Operation(summary = "Toggle favorite status of a note")
    public ResponseEntity<ApiResponse<NoteResponse>> toggleFavorite(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        NoteResponse note = noteService.toggleFavorite(id, principal.getUser());
        return ResponseEntity.ok(ApiResponse.<NoteResponse>builder()
                .success(true)
                .message(note.isFavorite() ? "Note added to favorites" : "Note removed from favorites")
                .data(note)
                .build());
    }

    @GetMapping("/search")
    @Operation(summary = "Search notes by text query in title, content, transcript, or category")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> searchNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = createPageable(page, size, "createdDate", "desc");
        Page<NoteResponse> notes = noteService.getAllNotes(principal.getUser(), query, null, null, null, null, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<NoteResponse>>builder()
                .success(true)
                .message("Search completed successfully")
                .data(notes)
                .build());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Filter notes by category")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> getByCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Category category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = createPageable(page, size, "createdDate", "desc");
        Page<NoteResponse> notes = noteService.getAllNotes(principal.getUser(), null, category, null, false, null, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<NoteResponse>>builder()
                .success(true)
                .message("Notes in category " + category + " retrieved successfully")
                .data(notes)
                .build());
    }

    @GetMapping("/pinned")
    @Operation(summary = "Get all pinned notes")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> getPinnedNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = createPageable(page, size, "createdDate", "desc");
        Page<NoteResponse> notes = noteService.getAllNotes(principal.getUser(), null, null, true, false, null, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<NoteResponse>>builder()
                .success(true)
                .message("Pinned notes retrieved successfully")
                .data(notes)
                .build());
    }

    @GetMapping("/favorites")
    @Operation(summary = "Get all favorite notes")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> getFavoriteNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = createPageable(page, size, "createdDate", "desc");
        Page<NoteResponse> notes = noteService.getAllNotes(principal.getUser(), null, null, null, false, true, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<NoteResponse>>builder()
                .success(true)
                .message("Favorite notes retrieved successfully")
                .data(notes)
                .build());
    }

    @GetMapping("/archived")
    @Operation(summary = "Get all archived notes")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> getArchivedNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = createPageable(page, size, "createdDate", "desc");
        Page<NoteResponse> notes = noteService.getAllNotes(principal.getUser(), null, null, null, true, null, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<NoteResponse>>builder()
                .success(true)
                .message("Archived notes retrieved successfully")
                .data(notes)
                .build());
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary data and category statistics")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardResponse stats = noteService.getDashboardData(principal.getUser());
        return ResponseEntity.ok(ApiResponse.<DashboardResponse>builder()
                .success(true)
                .message("Dashboard stats retrieved successfully")
                .data(stats)
                .build());
    }
}
