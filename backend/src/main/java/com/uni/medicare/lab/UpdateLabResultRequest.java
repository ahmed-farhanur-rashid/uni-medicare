package com.uni.medicare.lab;

public record UpdateLabResultRequest(
        String resultValue,
        String resultNotes,
        String resultStatus
) {}
