package org.nwvs.service.impl;

import org.nwvs.service.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Service
public class SmsServiceImpl implements SmsService {
    private static final Logger logger = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhoneNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtpSms(String phoneNumber, String otp) {
        sendSms(phoneNumber, "Your Voice Notes OTP code is: " + otp + ". Valid for 5 minutes.");
    }

    @Override
    public void sendSms(String phoneNumber, String message) {
        if (accountSid == null || accountSid.isEmpty() || 
            authToken == null || authToken.isEmpty() || 
            fromPhoneNumber == null || fromPhoneNumber.isEmpty()) {
            logger.info("Twilio SMS credentials not fully configured. Logging message fallback: Send to {}, Message: '{}'", phoneNumber, message);
            return;
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String auth = accountSid + ":" + authToken;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("From", fromPhoneNumber);
            map.add("To", phoneNumber);
            map.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Twilio SMS successfully sent to {}", phoneNumber);
            } else {
                logger.error("Failed to send Twilio SMS to {}. Response: {}", phoneNumber, response.getBody());
            }
        } catch (Exception e) {
            logger.error("Error sending Twilio SMS to {}: {}", phoneNumber, e.getMessage());
        }
    }
}
