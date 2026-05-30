package com.uni.medicare.billing;

import java.math.BigDecimal;

public record AddLineItemRequest(
        Integer serviceId,
        String description,
        int quantity,
        BigDecimal unitPrice
) {}
