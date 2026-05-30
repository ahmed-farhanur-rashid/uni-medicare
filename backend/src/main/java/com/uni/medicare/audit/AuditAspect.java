package com.uni.medicare.audit;

import com.uni.medicare.auth.AppUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * AOP advice that writes audit entries after sensitive service-layer operations
 * that are not already covered by database triggers.
 *
 * Pointcut targets: BillingService.payInvoice, BillingService.updateStatus,
 * AuthService.login (staff deactivation edge cases are handled by DB trigger).
 */
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    /** Audit every invoice payment */
    @AfterReturning(
        pointcut = "execution(* com.uni.medicare.billing.BillingService.payInvoice(..))",
        returning = "result"
    )
    public void afterPayInvoice(JoinPoint jp, Object result) {
        Object[] args = jp.getArgs();
        int invoiceId = (int) args[0];
        int studentId = (int) args[1];
        writeLog("student", studentId, "PAY_INVOICE", "invoices", invoiceId,
                 null, "{\"status\":\"paid\"}");
    }

    /** Audit invoice status changes (waived / cancelled) */
    @AfterReturning(
        pointcut = "execution(* com.uni.medicare.billing.BillingService.updateStatus(..))",
        returning = "result"
    )
    public void afterUpdateInvoiceStatus(JoinPoint jp, Object result) {
        Object[] args = jp.getArgs();
        int    invoiceId = (int) args[0];
        String newStatus = (String) args[1];
        int    actorId   = resolveActorId();
        String actorType = resolveActorType();
        writeLog(actorType, actorId, "UPDATE_INVOICE_STATUS", "invoices", invoiceId,
                 null, "{\"status\":\"" + newStatus + "\"}");
    }

    /** Audit login events */
    @AfterReturning(
        pointcut = "execution(* com.uni.medicare.auth.AuthService.login(..))",
        returning = "result"
    )
    public void afterLogin(JoinPoint jp, Object result) {
        Object[] args = jp.getArgs();
        com.uni.medicare.auth.LoginRequest req = (com.uni.medicare.auth.LoginRequest) args[0];
        com.uni.medicare.auth.LoginResponse resp = (com.uni.medicare.auth.LoginResponse) result;
        writeLog(resp.type(), resp.id(), "LOGIN", null, null,
                 null, "{\"role\":\"" + resp.role() + "\"}");
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private void writeLog(String actorType, int actorId, String action,
                          String table, Integer recordId,
                          String oldValue, String newValue) {
        auditService.log(actorType, actorId, action, table, recordId,
                         oldValue, newValue, resolveIp());
    }

    private int resolveActorId() {
        AppUserDetails u = principal();
        return u != null ? u.getId() : 0;
    }

    private String resolveActorType() {
        AppUserDetails u = principal();
        return u != null ? u.getType() : "system";
    }

    private AppUserDetails principal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AppUserDetails u) return u;
        return null;
    }

    private String resolveIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest req = attrs.getRequest();
            String forwarded = req.getHeader("X-Forwarded-For");
            return forwarded != null ? forwarded.split(",")[0].trim() : req.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }
}
