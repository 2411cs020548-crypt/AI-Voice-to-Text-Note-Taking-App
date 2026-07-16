package org.nwvs.service.impl;

import org.nwvs.service.TranslationService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@Service
public class TranslationServiceImpl implements TranslationService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @SuppressWarnings("unchecked")
    public String translateText(String text, String sourceLang, String targetLang) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        // Handle identical language request
        if (sourceLang.equalsIgnoreCase(targetLang)) {
            return text;
        }

        try {
            // Standardize language codes (e.g. en-US -> en, hi-IN -> hi, te-IN -> te)
            String src = sourceLang.split("-")[0].toLowerCase();
            String tgt = targetLang.split("-")[0].toLowerCase();

            String url = "https://api.mymemory.translated.net/get";
            URI targetUrl = UriComponentsBuilder.fromUriString(url)
                    .queryParam("q", text)
                    .queryParam("langpair", src + "|" + tgt)
                    .build()
                    .toUri();

            Map<String, Object> response = restTemplate.getForObject(targetUrl, Map.class);
            if (response != null && response.containsKey("responseData")) {
                Map<String, Object> responseData = (Map<String, Object>) response.get("responseData");
                if (responseData != null && responseData.containsKey("translatedText")) {
                    return (String) responseData.get("translatedText");
                }
            }
        } catch (Exception e) {
            // Log translation exception and fallback
        }

        // Mock fallback when offline or API limit reached
        return getMockTranslation(text, sourceLang, targetLang);
    }

    private String getMockTranslation(String text, String sourceLang, String targetLang) {
        String src = sourceLang.split("-")[0].toLowerCase();
        String tgt = targetLang.split("-")[0].toLowerCase();

        // Simple mock translations for common demo words if relevant
        if (text.trim().equalsIgnoreCase("hello") || text.trim().equalsIgnoreCase("hello!")) {
            if (tgt.equals("hi")) return "नमस्ते!";
            if (tgt.equals("te")) return "నమస్కారం!";
        }

        return "[Offline Translation " + src.toUpperCase() + " -> " + tgt.toUpperCase() + "]: " + text;
    }
}
