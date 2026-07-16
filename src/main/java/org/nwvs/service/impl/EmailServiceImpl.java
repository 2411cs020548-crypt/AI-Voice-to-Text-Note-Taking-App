package org.nwvs.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.nwvs.service.EmailService;
import org.nwvs.service.EmailTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String email, String name, String otp, String purpose) {
        sendHtmlEmail(email, "Voice Notes - OTP Verification", EmailTemplate.getOtpEmailTemplate(name, otp, purpose));
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Logging Email fallback: Send to {}, Subject: '{}', Content: '{}'", to, subject, htmlContent);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Html Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send HTML email to {}. Error: {}", to, e.getMessage());
            logger.warn("Logging Email fallback: Send to {}, Content: '{}'", to, htmlContent);
        }
    }
}
