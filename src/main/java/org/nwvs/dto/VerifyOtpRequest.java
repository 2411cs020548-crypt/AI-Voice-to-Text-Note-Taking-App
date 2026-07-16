package org.nwvs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequest {

    @NotBlank(message = "Identifier (email or phone) is required")
    private String email;

    @NotBlank(message = "OTP code is required")
    private String otp;
}
