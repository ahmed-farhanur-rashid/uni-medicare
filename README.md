# Uni Medicare — Spring Boot Backend

## Quick Start (Zero Java Install Required)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — that's it.
- VS Code or Antigravity with the **Dev Containers** extension installed.

---

### Option A — Open in Dev Container (Recommended)
1. Open this folder in VS Code / Antigravity
2. Click **"Reopen in Container"** when prompted (or `Ctrl+Shift+P` → "Dev Containers: Reopen in Container")
3. Wait ~2 minutes for Java 21 + Maven to download once
4. Hit **Run** in the Spring Boot Dashboard, or in the terminal: `./mvnw spring-boot:run`
5. API is live at `http://localhost:8080`

### Option B — Docker Compose only
```bash
docker compose up --build
```
MySQL starts first, schema is auto-imported, then the app starts on port 8080.

---

## Testing the API

### Login (get a JWT)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"eId": 1001, "password": "secret"}'
```

### Use the token
```bash
curl http://localhost:8080/api/appointments \
  -H "Authorization: Bearer <token>"
```

---

## Project Structure
```
com.uni.medicare
├── auth           — JWT login, filter, UserDetails
├── appointment    — System 1
├── consultation   — System 2
├── vital          — System 3
├── prescription   — System 4
├── lab            — System 5
├── billing        — System 6 (stored procedures)
├── notification   — System 7
├── audit          — System 8 (AOP + read endpoint)
├── admin          — System 9 (CRUD for staff/departments)
└── shared
    ├── config     — SecurityConfig, CORS
    ├── exception  — GlobalExceptionHandler
    └── util       — JwtUtil
```

## Key Design Notes
| Concept | Where to look |
|---|---|
| JWT generation & parsing | `shared/util/JwtUtil.java` |
| Request authentication filter | `auth/JwtAuthFilter.java` |
| Role-based access | `@PreAuthorize` on every controller method |
| Student validity check (active + not expired) | `auth/StudentValidityFilter.java` |
| Generated columns (bmi, expires_on, total_price) | Marked `insertable=false, updatable=false` on entities |
| Stored procedure calls | `billing/BillingService.java` via `SimpleJdbcCall` |
| JSON columns (audit old/new value) | `audit/AuditLog.java` with `@JdbcTypeCode(SqlTypes.JSON)` |
| AOP audit logging | `audit/AuditAspect.java` |
| DB triggers (invoice on vitals, complete appointment) | `src/main/resources/unimedicare_v3.sql` |
