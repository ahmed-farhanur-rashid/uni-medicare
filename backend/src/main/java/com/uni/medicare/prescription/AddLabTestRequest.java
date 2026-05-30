package com.uni.medicare.prescription;

public record AddLabTestRequest(
        Integer catalogId,    // optional — from lab_test_catalog
        String labTestName    // free-text fallback
) {}
