package com.uni.medicare.billing;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Simulates a real payment gateway with 90% success / 10% failure rate.
 * In production, replace with Stripe, PayPal, or bKash integration.
 */
@Component
@Slf4j
public class MockPaymentGateway {

    private static final double SUCCESS_RATE = 0.90;

    public PaymentGatewayResponse processPayment(BigDecimal amount, int studentId, String description) {
        log.info("MockPaymentGateway: Processing payment of {} for student {} — {}",
                amount, studentId, description);

        boolean success = ThreadLocalRandom.current().nextDouble() < SUCCESS_RATE;

        if (success) {
            log.info("MockPaymentGateway: Payment SUCCESS for student {}", studentId);
            return PaymentGatewayResponse.success(amount);
        } else {
            log.warn("MockPaymentGateway: Payment FAILED for student {} — simulated decline", studentId);
            return PaymentGatewayResponse.failure();
        }
    }
}
