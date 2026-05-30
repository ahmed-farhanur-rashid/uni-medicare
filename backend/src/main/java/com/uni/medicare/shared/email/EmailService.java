package com.uni.medicare.shared.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async
    public void sendVerificationEmail(String to, String verificationUrl) {
        send(to, "Verify your Uni Medicare email",
                "Welcome to Uni Medicare!\n\n" +
                "Please verify your email by clicking the link below:\n\n" +
                verificationUrl + "\n\n" +
                "This link expires in 24 hours.\n\n" +
                "If you did not create an account, please ignore this email.");
    }

    @Async
    public void sendPasswordResetEmail(String to, String resetUrl) {
        send(to, "Reset your Uni Medicare password",
                "You requested a password reset.\n\n" +
                "Click the link below to reset your password:\n\n" +
                resetUrl + "\n\n" +
                "This link expires in 1 hour.\n\n" +
                "If you did not request a reset, please ignore this email.");
    }

    @Async
    public void sendAppointmentConfirmation(String to, String doctorName, String scheduledTime) {
        send(to, "Appointment Confirmed — Uni Medicare",
                "Your appointment has been booked.\n\n" +
                "Doctor: " + doctorName + "\n" +
                "Scheduled: " + scheduledTime + "\n\n" +
                "Please arrive 15 minutes early. If you need to cancel, do so at least 24 hours in advance.");
    }

    @Async
    public void sendLabResultReady(String to, String testName) {
        send(to, "Lab Result Ready — Uni Medicare",
                "Your lab result for \"" + testName + "\" is now available.\n\n" +
                "Log in to view your result in the Lab Results section.");
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
