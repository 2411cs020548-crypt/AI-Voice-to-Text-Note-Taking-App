package org.nwvs.service.impl;

import org.nwvs.entity.Otp;
import org.nwvs.entity.OtpPurpose;
import org.nwvs.entity.User;
import org.nwvs.exception.ValidationException;
import org.nwvs.repository.OtpRepository;
import org.nwvs.repository.UserRepository;
import org.nwvs.service.EmailService;
import org.nwvs.service.OtpService;
import org.nwvs.service.SmsService;
import org.nwvs.util.OtpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OtpServiceImpl implements OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Value("${app.otp.max-resends:3}")
    private int maxResends;

    @Override
    @Transactional
    public void generateAndSendOtp(User user, OtpPurpose purpose) {
        // Invalidate previous active OTPs by deleting them
        List<Otp> oldOtps = otpRepository.findByUserAndPurpose(user, purpose);
        otpRepository.deleteAll(oldOtps);

        // Generate and Hash OTP
        String plainOtp = OtpUtil.generate6DigitOtp();
        String otpHash = passwordEncoder.encode(plainOtp);

        Otp otp = Otp.builder()
                .user(user)
                .otpHash(otpHash)
                .purpose(purpose)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .attempts(0)
                .resendCount(0)
                .build();

        otpRepository.save(otp);

        // Send OTP via email and SMS
        emailService.sendOtpEmail(user.getEmail(), user.getName(), plainOtp, purpose.name());
        smsService.sendOtpSms(user.getPhoneNumber(), plainOtp);
    }

    @Override
    @Transactional
    public void verifyOtp(String emailOrPhone, String plainOtp, OtpPurpose purpose) {
        User user = userRepository.findByEmailOrPhoneNumber(emailOrPhone, emailOrPhone)
                .orElseThrow(() -> new ValidationException("User not found"));

        List<Otp> otps = otpRepository.findByUserAndPurposeAndUsedFalse(user, purpose);
        if (otps.isEmpty()) {
            throw new ValidationException("No active OTP found. Please request a new one.");
        }

        // Use the latest OTP
        Otp activeOtp = otps.get(otps.size() - 1);

        if (activeOtp.isUsed()) {
            throw new ValidationException("OTP Already Used.");
        }

        if (activeOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidationException("OTP Expired.");
        }

        // Limit attempts to 5
        if (activeOtp.getAttempts() >= 5) {
            // Force deletion of this expired/invalidated OTP
            otpRepository.delete(activeOtp);
            throw new ValidationException("Maximum verification attempts exceeded. Please generate a new OTP.");
        }

        // Increment attempts count
        activeOtp.setAttempts(activeOtp.getAttempts() + 1);
        otpRepository.save(activeOtp);

        // Match OTP hash
        if (!passwordEncoder.matches(plainOtp, activeOtp.getOtpHash())) {
            throw new ValidationException("Invalid OTP.");
        }

        // Mark OTP as used and update
        activeOtp.setUsed(true);
        otpRepository.save(activeOtp);

        // If purpose is REGISTER, mark user as verified
        if (purpose == OtpPurpose.REGISTER) {
            user.setVerified(true);
            userRepository.save(user);
        }

        // Delete all OTPs for this purpose as clean-up
        List<Otp> userOtps = otpRepository.findByUserAndPurpose(user, purpose);
        otpRepository.deleteAll(userOtps);
    }

    @Override
    @Transactional
    public void resendOtp(String emailOrPhone, String purposeStr) {
        User user = userRepository.findByEmailOrPhoneNumber(emailOrPhone, emailOrPhone)
                .orElseThrow(() -> new ValidationException("User not found"));

        OtpPurpose purpose;
        try {
            purpose = OtpPurpose.valueOf(purposeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid OTP purpose");
        }

        int currentResendCount = 0;
        List<Otp> oldOtps = otpRepository.findByUserAndPurpose(user, purpose);
        if (!oldOtps.isEmpty()) {
            Otp latestOld = oldOtps.get(oldOtps.size() - 1);

            // Rate limit: 60 seconds
            if (latestOld.getCreatedAt().plusSeconds(60).isAfter(LocalDateTime.now())) {
                throw new ValidationException("Please wait 60 seconds before requesting a new OTP.");
            }

            currentResendCount = latestOld.getResendCount();
            if (currentResendCount >= maxResends) {
                throw new ValidationException("Maximum resend attempts reached. Please request verification again later.");
            }

            // Invalidate/delete old OTPs
            otpRepository.deleteAll(oldOtps);
        }

        // Generate new OTP
        String plainOtp = OtpUtil.generate6DigitOtp();
        String otpHash = passwordEncoder.encode(plainOtp);

        Otp otp = Otp.builder()
                .user(user)
                .otpHash(otpHash)
                .purpose(purpose)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .attempts(0)
                .resendCount(currentResendCount + 1)
                .build();

        otpRepository.save(otp);

        // Send OTP
        emailService.sendOtpEmail(user.getEmail(), user.getName(), plainOtp, purpose.name());
        smsService.sendOtpSms(user.getPhoneNumber(), plainOtp);
    }
}
