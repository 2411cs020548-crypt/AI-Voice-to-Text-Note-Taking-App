package org.nwvs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResendOtpRequest {

    @NotBlank(message = "Identifier (email or phone) is required")
    private String email;

    @NotBlank(message = "Purpose is required")
    private String purpose;
}
