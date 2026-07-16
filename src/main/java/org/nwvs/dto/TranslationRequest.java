package org.nwvs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranslationRequest {

    @NotBlank(message = "Text is required")
    private String text;

    @NotBlank(message = "Source language is required")
    private String sourceLang;

    @NotBlank(message = "Target language is required")
    private String targetLang;
}
