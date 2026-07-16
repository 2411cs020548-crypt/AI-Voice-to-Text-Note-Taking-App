package org.nwvs.service;

public class EmailTemplate {
    public static String getOtpEmailTemplate(String name, String otp, String purpose) {
        String purposeText = purpose.equals("REGISTER") 
                ? "verify your registration" 
                : purpose.equals("RESET_PASSWORD") 
                ? "reset your password" 
                : "log in to your account";
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc;\">" +
                "  <div style=\"text-align: center; margin-bottom: 20px;\">" +
                "    <h2 style=\"color: #6366f1; margin: 0;\">Voice Notes System</h2>" +
                "  </div>" +
                "  <div style=\"background-color: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);\">" +
                "    <p style=\"color: #475569; font-size: 16px;\">Hello <strong>" + name + "</strong>,</p>" +
                "    <p style=\"color: #475569; font-size: 16px;\">Thank you for using Voice Notes. Please use the following One-Time Password (OTP) to " + purposeText + ":</p>" +
                "    <div style=\"text-align: center; margin: 30px 0;\">" +
                "      <span style=\"display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #6366f1; background-color: rgba(99, 102, 241, 0.1); padding: 10px 20px; border-radius: 8px;\">" + otp + "</span>" +
                "    </div>" +
                "    <p style=\"color: #94a3b8; font-size: 14px; text-align: center;\">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>" +
                "  </div>" +
                "  <div style=\"text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;\">" +
                "    © " + java.time.Year.now().getValue() + " Voice Notes System. All rights reserved." +
                "  </div>" +
                "</div>";
    }

    public static String getForgotPasswordInitiationTemplate(String name, String yesUrl, String noUrl) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc;\">" +
                "  <div style=\"text-align: center; margin-bottom: 20px;\">" +
                "    <h2 style=\"color: #6366f1; margin: 0;\">Voice Notes System</h2>" +
                "  </div>" +
                "  <div style=\"background-color: #ffffff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);\">" +
                "    <p style=\"color: #475569; font-size: 16px;\">Hello <strong>" + name + "</strong>,</p>" +
                "    <p style=\"color: #475569; font-size: 16px;\">We received a request to recover your account's password. Did you initiate this request?</p>" +
                "    <div style=\"text-align: center; margin: 30px 0;\">" +
                "      <a href=\"" + yesUrl + "\" style=\"display: inline-block; text-decoration: none; font-size: 15px; font-weight: bold; color: #ffffff; background-color: #10b981; padding: 12px 24px; border-radius: 8px; margin-right: 15px;\">Yes, it was me</a>" +
                "      <a href=\"" + noUrl + "\" style=\"display: inline-block; text-decoration: none; font-size: 15px; font-weight: bold; color: #ffffff; background-color: #ef4444; padding: 12px 24px; border-radius: 8px;\">No, it wasn't me</a>" +
                "    </div>" +
                "    <p style=\"color: #94a3b8; font-size: 14px; text-align: center;\">These links are valid for <strong>10 minutes</strong>. If you click \"No\", the recovery attempt will be blocked immediately.</p>" +
                "  </div>" +
                "  <div style=\"text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;\">" +
                "    © " + java.time.Year.now().getValue() + " Voice Notes System. All rights reserved." +
                "  </div>" +
                "</div>";
    }
}
