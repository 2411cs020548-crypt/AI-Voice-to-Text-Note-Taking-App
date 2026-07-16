package org.nwvs.service;

import org.nwvs.dto.LoginRequest;
import org.nwvs.dto.LoginResponse;
import org.nwvs.dto.RegisterRequest;
import org.nwvs.dto.UserProfileResponse;
import org.nwvs.entity.User;

public interface UserService {
    void registerUser(RegisterRequest request);
    LoginResponse loginUser(LoginRequest request);
    void verifyRegistrationOtp(String emailOrPhone, String otp);
    LoginResponse verifyLoginOtp(String emailOrPhone, String otp);
    UserProfileResponse getUserProfile(User currentUser);
}
