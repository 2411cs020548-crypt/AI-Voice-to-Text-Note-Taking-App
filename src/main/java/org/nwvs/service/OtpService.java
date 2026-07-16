package org.nwvs.service;

import org.nwvs.entity.OtpPurpose;
import org.nwvs.entity.User;

public interface OtpService {
    void generateAndSendOtp(User user, OtpPurpose purpose);
    void verifyOtp(String emailOrPhone, String plainOtp, OtpPurpose purpose);
    void resendOtp(String emailOrPhone, String purposeStr);
}
