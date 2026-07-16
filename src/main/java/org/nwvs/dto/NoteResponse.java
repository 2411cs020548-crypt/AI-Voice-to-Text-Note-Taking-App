package org.nwvs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.nwvs.entity.Category;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private String voiceTranscript;
    private Category category;
    private String color;
    private boolean pinned;
    private boolean archived;
    private boolean favorite;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
