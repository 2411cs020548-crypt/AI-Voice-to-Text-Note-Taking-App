package org.nwvs.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.nwvs.dto.*;
import org.nwvs.security.UserPrincipal;
import org.nwvs.service.OtpService;
import org.nwvs.service.UserService;
import org.nwvs.service.EmailService;
import org.nwvs.service.SmsService;
import org.nwvs.repository.UserRepository;
import org.nwvs.repository.ForgotPasswordRequestRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication Management APIs")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ForgotPasswordRequestRepository forgotPasswordRequestRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @Operation(summary = "Register a new user (account is created as inactive, OTP sent to email)")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest request) {
        userService.registerUser(request);
        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("User registered successfully. Please verify your OTP.")
                .data(null)
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Step 1 of Login: Authenticate credentials and send Login OTP")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse loginResponse = userService.loginUser(request);
        ApiResponse<LoginResponse> response = ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Login credentials validated. Please verify the OTP sent to your registered email.")
                .data(loginResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-registration-otp")
    @Operation(summary = "Verify registration OTP to activate the user account")
    public ResponseEntity<ApiResponse<Object>> verifyRegistrationOtp(@Valid @RequestBody VerifyOtpRequest request) {
        userService.verifyRegistrationOtp(request.getEmail(), request.getOtp());
        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("Account verified successfully. You can now log in.")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-login-otp")
    @Operation(summary = "Step 2 of Login: Verify OTP and return JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyLoginOtp(@Valid @RequestBody VerifyOtpRequest request) {
        LoginResponse loginResponse = userService.verifyLoginOtp(request.getEmail(), request.getOtp());
        ApiResponse<LoginResponse> response = ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Login successful")
                .data(loginResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend a new OTP code (limit: once per 60 seconds)")
    public ResponseEntity<ApiResponse<Object>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        otpService.resendOtp(request.getEmail(), request.getPurpose());
        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("A new OTP has been sent successfully.")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate security context")
    public ResponseEntity<ApiResponse<Object>> logout() {
        SecurityContextHolder.clearContext();
        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("Logged out successfully")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated user's profile details")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            ApiResponse<UserProfileResponse> response = ApiResponse.<UserProfileResponse>builder()
                    .success(false)
                    .message("User not authenticated")
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        UserProfileResponse profileResponse = userService.getUserProfile(principal.getUser());
        ApiResponse<UserProfileResponse> response = ApiResponse.<UserProfileResponse>builder()
                .success(true)
                .message("User profile retrieved successfully")
                .data(profileResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/initiate")
    @Operation(summary = "Step 1 of Forgot Password: Request a verification link via email & SMS")
    public ResponseEntity<ApiResponse<Object>> initiateForgotPassword(@Valid @RequestBody ForgotPasswordInitiateRequest request) {
        String identifier = request.getIdentifier().trim();
        org.nwvs.entity.User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
                .orElseThrow(() -> new org.nwvs.exception.ResourceNotFoundException("User not found with email/phone: " + identifier));

        String token = java.util.UUID.randomUUID().toString();
        
        org.nwvs.entity.ForgotPasswordRequest pwRequest = org.nwvs.entity.ForgotPasswordRequest.builder()
                .token(token)
                .user(user)
                .status("PENDING")
                .createdAt(java.time.LocalDateTime.now())
                .expiresAt(java.time.LocalDateTime.now().plusMinutes(10))
                .build();
        forgotPasswordRequestRepository.save(pwRequest);

        String yesUrl = "http://localhost:8080/api/auth/forgot-password/confirm?token=" + token + "&choice=yes";
        String noUrl = "http://localhost:8080/api/auth/forgot-password/confirm?token=" + token + "&choice=no";
        
        String emailContent = org.nwvs.service.EmailTemplate.getForgotPasswordInitiationTemplate(user.getName(), yesUrl, noUrl);
        emailService.sendHtmlEmail(user.getEmail(), "Voice Notes - Password Recovery Verification", emailContent);

        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
            String smsMessage = "Voice Notes password recovery requested. Click to confirm:\nYES: " + yesUrl + "\nNO: " + noUrl;
            smsService.sendSms(user.getPhoneNumber(), smsMessage);
        }

        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("A security verification link has been sent to your registered email and phone number.")
                .data(token)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/forgot-password/confirm", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Callback for Forgot Password YES/NO verification links")
    @ResponseBody
    public String confirmForgotPassword(
            @RequestParam("token") String token,
            @RequestParam("choice") String choice) {
        
        org.nwvs.entity.ForgotPasswordRequest pwRequest = forgotPasswordRequestRepository.findByToken(token)
                .orElse(null);

        if (pwRequest == null) {
            return "<html><body><h2>Invalid or expired recovery token.</h2></body></html>";
        }

        if (pwRequest.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            pwRequest.setStatus("EXPIRED");
            forgotPasswordRequestRepository.save(pwRequest);
            return "<html><body><h2>This recovery token has expired. Please request a new one.</h2></body></html>";
        }

        if (!pwRequest.getStatus().equals("PENDING")) {
            return "<html><body><h2>This request has already been processed.</h2></body></html>";
        }

        if (choice.equalsIgnoreCase("no")) {
            pwRequest.setStatus("NO");
            forgotPasswordRequestRepository.save(pwRequest);

            return "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head>\n" +
                    "    <title>Request Blocked</title>\n" +
                    "    <link href=\"https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap\" rel=\"stylesheet\">\n" +
                    "    <style>\n" +
                    "        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n" +
                    "        .card { background: #ffffff; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 40px; text-align: center; max-width: 450px; width: 90%; border: 1px solid #e2e8f0; }\n" +
                    "        h1 { font-family: 'Outfit', sans-serif; color: #ef4444; font-size: 28px; margin-bottom: 10px; }\n" +
                    "        p { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px; }\n" +
                    "        .shield-icon { font-size: 64px; margin-bottom: 15px; }\n" +
                    "    </style>\n" +
                    "</head>\n" +
                    "<body>\n" +
                    "    <div class=\"card\">\n" +
                    "        <div class=\"shield-icon\">🛡️</div>\n" +
                    "        <h1>Request Blocked</h1>\n" +
                    "        <p>The password recovery attempt has been immediately cancelled and blocked. Your account password remains unchanged and secure.</p>\n" +
                    "        <p style=\"font-size: 14px; color: #64748b;\">If you did not initiate this, someone else may have tried to access your account. No further action is required, but we recommend monitoring your credentials.</p>\n" +
                    "    </div>\n" +
                    "</body>\n" +
                    "</html>";
        } else if (choice.equalsIgnoreCase("yes")) {
            String otp = org.nwvs.util.OtpUtil.generate6DigitOtp();
            pwRequest.setStatus("YES");
            pwRequest.setOtpHash(passwordEncoder.encode(otp));
            forgotPasswordRequestRepository.save(pwRequest);

            org.nwvs.entity.User user = pwRequest.getUser();
            String otpContent = org.nwvs.service.EmailTemplate.getOtpEmailTemplate(user.getName(), otp, "RESET_PASSWORD");
            emailService.sendHtmlEmail(user.getEmail(), "Voice Notes - Password Reset OTP", otpContent);

            if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
                smsService.sendOtpSms(user.getPhoneNumber(), otp);
            }

            return "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head>\n" +
                    "    <title>Request Confirmed</title>\n" +
                    "    <link href=\"https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap\" rel=\"stylesheet\">\n" +
                    "    <style>\n" +
                    "        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n" +
                    "        .card { background: #ffffff; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 40px; text-align: center; max-width: 450px; width: 90%; border: 1px solid #e2e8f0; }\n" +
                    "        h1 { font-family: 'Outfit', sans-serif; color: #10b981; font-size: 28px; margin-bottom: 10px; }\n" +
                    "        p { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px; }\n" +
                    "        .otp-box { font-size: 32px; font-weight: 700; color: #6366f1; background-color: rgba(99, 102, 241, 0.1); padding: 15px; border-radius: 12px; letter-spacing: 5px; margin-bottom: 20px; display: inline-block; border: 1px dashed #6366f1; }\n" +
                    "        .instructions { font-size: 14px; color: #64748b; }\n" +
                    "    </style>\n" +
                    "</head>\n" +
                    "<body>\n" +
                    "    <div class=\"card\">\n" +
                    "        <h1>Identity Confirmed</h1>\n" +
                    "        <p>Your password recovery request has been verified. We have sent the OTP code to your registered email and phone. You can also view it directly here:</p>\n" +
                    "        <div class=\"otp-box\">" + otp + "</div>\n" +
                    "        <p class=\"instructions\">Please enter this code on the password reset screen in the app to choose a new password.</p>\n" +
                    "    </div>\n" +
                    "</body>\n" +
                    "</html>";
        }

        return "<html><body><h2>Invalid choice selection.</h2></body></html>";
    }

    @PostMapping("/forgot-password/reset")
    @Operation(summary = "Step 3 of Forgot Password: Verify OTP and set a new password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@Valid @RequestBody ForgotPasswordResetRequest request) {
        String token = request.getToken();
        String identifier = request.getIdentifier().trim();
        String otp = request.getOtp();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        org.nwvs.entity.ForgotPasswordRequest pwRequest = forgotPasswordRequestRepository.findByToken(token)
                .orElseThrow(() -> new org.nwvs.exception.ResourceNotFoundException("Recovery request not found with token: " + token));

        if (!pwRequest.getStatus().equals("YES")) {
            throw new IllegalStateException("This password reset request has not been verified yet.");
        }

        if (pwRequest.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            pwRequest.setStatus("EXPIRED");
            forgotPasswordRequestRepository.save(pwRequest);
            throw new IllegalStateException("This password reset request has expired.");
        }

        if (pwRequest.getOtpHash() == null || !passwordEncoder.matches(otp, pwRequest.getOtpHash())) {
            throw new IllegalArgumentException("Invalid OTP code.");
        }

        org.nwvs.entity.User user = pwRequest.getUser();
        if (!user.getEmail().equalsIgnoreCase(identifier) && !identifier.equals(user.getPhoneNumber())) {
            throw new IllegalArgumentException("Identifier does not match the recovery request user.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        pwRequest.setStatus("COMPLETED");
        forgotPasswordRequestRepository.save(pwRequest);

        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("Your password has been successfully reset. You can now log in.")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }
}
