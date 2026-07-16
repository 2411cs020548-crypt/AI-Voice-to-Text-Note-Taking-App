package org.nwvs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordInitiateRequest {
    @NotBlank(message = "Identifier (email or phone number) is required")
    private String identifier;
}
