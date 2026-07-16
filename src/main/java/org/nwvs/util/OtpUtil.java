package org.nwvs.util;

import java.security.SecureRandom;

public class OtpUtil {
    private static final SecureRandom random = new SecureRandom();

    public static String generate6DigitOtp() {
        int number = random.nextInt(900000) + 100000;
        return String.valueOf(number);
    }
}
