# Uni-Medicare — Task Tracker

## Phase 1: Bug Fixes
- [ ] Fix student password validation in AuthService (line 59)
- [ ] Fix student→patient ID lookup in AppointmentController, ConsultationController, LabResultController
- [ ] Fix admin staff password leak — return DTO, hash passwords
- [ ] Fix PrescriptionService.addLabTest() — create LabResult row
- [ ] Fix BillingService hardcoded account ID → @Value
- [ ] Fix NotificationService channel — add channel to request

## Phase 2: Security + Config
- [ ] Update SecurityConfig — permit Swagger + new auth endpoints
- [ ] Create OpenApiConfig.java

## Phase 3: Auth Extensions
- [ ] Create EmailVerificationToken entity
- [ ] Create EmailVerificationService
- [ ] Create PasswordResetToken entity
- [ ] Create PasswordResetService
- [ ] Add verify-email, forgot-password, reset-password endpoints to AuthController

## Phase 4: Email Service
- [ ] Create EmailService.java (4 templates)

## Phase 5: File Upload System
- [ ] Create FileUpload entity
- [ ] Create FileUploadRepository
- [ ] Create FileUploadService
- [ ] Create FileUploadController (3 endpoints)

## Phase 6: Mock Payment Gateway
- [ ] Create MockPaymentGateway
- [ ] Create PaymentGatewayResponse
- [ ] Update BillingService to use gateway

## Phase 7: Admin Endpoints
- [ ] Create StudentAdminController (CRUD)
- [ ] Create ServiceAdminController (CRUD)

## Phase 8: Audit Pagination + Login Logging
- [ ] Update AuditService — Pageable
- [ ] Update AuditController — accept Pageable
- [ ] Update AuditAspect — login event pointcut

## Phase 9: Wire DTOs into Controllers
- [ ] Update all controllers to return DTOs instead of raw entities
- [ ] Update admin staff endpoints — hash passwords, return DTOs

## Phase 10: Verification
- [ ] Build verification (mvnw compile)
- [ ] Docker compose validation
- [ ] Full stack boot test
- [ ] Swagger UI test
- [ ] Login test with seed data
