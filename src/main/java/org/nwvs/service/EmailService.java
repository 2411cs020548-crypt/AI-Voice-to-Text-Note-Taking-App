package org.nwvs.service;

public interface EmailService {
    void sendOtpEmail(String email, String name, String otp, String purpose);
    void sendHtmlEmail(String to, String subject, String htmlContent);
}
