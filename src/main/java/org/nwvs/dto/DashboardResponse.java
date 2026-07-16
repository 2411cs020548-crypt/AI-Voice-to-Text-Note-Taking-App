package org.nwvs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.nwvs.entity.Category;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalNotes;
    private long pinnedNotes;
    private long favoriteNotes;
    private long archivedNotes;
    private List<NoteResponse> latestNotes;
    private Map<Category, Long> categoryStats;
}
