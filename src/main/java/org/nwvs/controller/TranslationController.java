package org.nwvs.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.nwvs.dto.ApiResponse;
import org.nwvs.dto.TranslationRequest;
import org.nwvs.dto.TranslationResponse;
import org.nwvs.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes")
@Tag(name = "Translation", description = "Note Translation APIs")
public class TranslationController {

    @Autowired
    private TranslationService translationService;

    @PostMapping("/translate")
    @Operation(summary = "Translate text between English, Hindi, and Telugu")
    public ResponseEntity<ApiResponse<TranslationResponse>> translate(@Valid @RequestBody TranslationRequest request) {
        String translatedText = translationService.translateText(request.getText(), request.getSourceLang(), request.getTargetLang());
        TranslationResponse translationResponse = TranslationResponse.builder()
                .translatedText(translatedText)
                .build();
        
        return ResponseEntity.ok(ApiResponse.<TranslationResponse>builder()
                .success(true)
                .message("Translation successful")
                .data(translationResponse)
                .build());
    }
}
