package org.nwvs.service.impl;

import org.nwvs.dto.LoginRequest;
import org.nwvs.dto.LoginResponse;
import org.nwvs.dto.RegisterRequest;
import org.nwvs.dto.UserProfileResponse;
import org.nwvs.entity.OtpPurpose;
import org.nwvs.entity.User;
import org.nwvs.exception.AuthenticationException;
import org.nwvs.exception.ValidationException;
import org.nwvs.repository.UserRepository;
import org.nwvs.security.JwtTokenProvider;
import org.nwvs.security.UserPrincipal;
import org.nwvs.service.OtpService;
import org.nwvs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private OtpService otpService;

    @Override
    @Transactional
    public void registerUser(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email is already registered");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ValidationException("Phone number is already registered");
        }

        // Simple format validations
        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ValidationException("Invalid email format");
        }

        if (!request.getPhoneNumber().matches("^\\+?[0-9]{10,15}$")) {
            throw new ValidationException("Invalid phone number format");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .verified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Generate and Send Verification OTP
        otpService.generateAndSendOtp(savedUser, OtpPurpose.REGISTER);
    }

    @Override
    @Transactional
    public LoginResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmailOrPhoneNumber(request.getEmail(), request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email/phone or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Invalid email/phone or password");
        }

        if (!user.isVerified()) {
            throw new AuthenticationException("Account not verified. Please verify your registration first.");
        }

        // Generate and Send Login OTP (2FA)
        otpService.generateAndSendOtp(user, OtpPurpose.LOGIN);

        // Indicate to the frontend that OTP is required to log in
        return LoginResponse.builder()
                .token(null)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .otpRequired(true)
                .build();
    }

    @Override
    @Transactional
    public void verifyRegistrationOtp(String emailOrPhone, String otp) {
        otpService.verifyOtp(emailOrPhone, otp, OtpPurpose.REGISTER);
    }

    @Override
    @Transactional
    public LoginResponse verifyLoginOtp(String emailOrPhone, String otp) {
        // Verify OTP
        otpService.verifyOtp(emailOrPhone, otp, OtpPurpose.LOGIN);

        // Fetch User and construct Authentication
        User user = userRepository.findByEmailOrPhoneNumber(emailOrPhone, emailOrPhone)
                .orElseThrow(() -> new ValidationException("User not found"));

        UserPrincipal principal = new UserPrincipal(user);
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        // Generate final JWT
        String jwt = tokenProvider.generateToken(authenticationToken);

        return LoginResponse.builder()
                .token(jwt)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .otpRequired(false)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(User currentUser) {
        return UserProfileResponse.builder()
                .id(currentUser.getId())
                .name(currentUser.getName())
                .email(currentUser.getEmail())
                .phoneNumber(currentUser.getPhoneNumber())
                .createdAt(currentUser.getCreatedAt())
                .build();
    }
}
