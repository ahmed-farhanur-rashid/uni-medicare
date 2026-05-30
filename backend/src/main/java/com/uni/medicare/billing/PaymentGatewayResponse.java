package com.uni.medicare.billing;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentGatewayResponse(
        boolean success,
        String gatewayTransactionId,
        String message
) {
    public static PaymentGatewayResponse success(BigDecimal amount) {
        return new PaymentGatewayResponse(true,
                "GW-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                "Payment of " + amount + " processed successfully");
    }

    public static PaymentGatewayResponse failure() {
        return new PaymentGatewayResponse(false,
                null,
                "Payment gateway declined the transaction. Please try again later.");
    }
}
