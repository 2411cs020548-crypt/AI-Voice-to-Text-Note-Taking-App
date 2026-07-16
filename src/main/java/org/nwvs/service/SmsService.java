package org.nwvs.service;

public interface SmsService {
    void sendOtpSms(String phoneNumber, String otp);
    void sendSms(String phoneNumber, String message);
}
