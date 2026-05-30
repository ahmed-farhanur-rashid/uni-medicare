# uni-medicare — Frontend Plan
> Feed this to your AI (Mimo or Claude) to vibe-code a beautiful Next.js frontend.
> This plan is intentionally UI-focused. The backend API is already defined in plan_backend.md.
> Your job is to make this look and feel like a real medical center portal.

---

## Project Overview

A university medical center patient and staff portal. Clean, modern, professional UI.
Not a hospital. Not a clinic chain. A **university health center** — think calm, trustworthy, accessible.

**Audience:** University students and medical staff (doctors, nurses, receptionists, lab techs, admin).

---

## Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| HTTP Client | Axios (with interceptors for JWT) |
| State Management | Zustand (lightweight, simple) |
| Forms | React Hook Form + Zod validation |
| Date handling | date-fns |
| File uploads | Native `<input type="file">` + Axios multipart |
| Charts | Recharts (for admin dashboard) |

---

## Design Direction

**Vibe:** Clean university portal. Think student portal meets health app. Not clinical white and sterile — warm, approachable, trustworthy.

**Color palette suggestion:**
- Primary: Deep teal (`#0D7377`) — trustworthy, medical, not cold
- Secondary: Warm white / off-white (`#F8F9FA`) backgrounds
- Accent: Soft amber (`#F4A261`) for notifications and warnings
- Success: Muted green (`#2D6A4F`)
- Danger: Soft red (`#E63946`)
- Text: Dark slate (`#1D2D44`)

**Typography:** Inter or Geist (Next.js default) — clean, readable, modern

**Layout:** Sidebar navigation (collapsible on mobile), top bar with user info and notifications bell, content area.

**Feel:** Every page should feel like it belongs in a real university system. No toy-app vibes. Real tables, real forms, real feedback.

---

## Monorepo Location

```
uni-medicare/
├── frontend/
│   ├── app/                  ← Next.js App Router pages
│   ├── components/           ← Shared UI components
│   ├── lib/                  ← API client, auth helpers, utils
│   ├── store/                ← Zustand state stores
│   ├── types/                ← TypeScript interfaces matching backend DTOs
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── Dockerfile
```

---

## Authentication & Routing

### Login Page (`/login`)
- Single login form for all users (students and staff)
- Fields: **eID** (university ID number) + **Password**
- On success: store JWT in memory (Zustand) + httpOnly cookie via a Next.js API route
- On error: show clear message ("Invalid credentials", "Account inactive", "Enrollment expired")
- Redirect to role-appropriate dashboard after login
- Clean, centered card design — university logo placeholder at top

### Route Protection
- Use Next.js middleware (`middleware.ts`) to protect all routes under `/dashboard`
- Read JWT from cookie, decode role, redirect to `/login` if invalid
- Role-based redirects:
  - STUDENT → `/dashboard/student`
  - DOCTOR → `/dashboard/doctor`
  - NURSE → `/dashboard/nurse`
  - LAB_TECHNICIAN → `/dashboard/lab`
  - RECEPTIONIST → `/dashboard/reception`
  - ADMIN → `/dashboard/admin`

---

## Shared Layout (`/dashboard/layout.tsx`)

All dashboard pages share:
- **Sidebar** with role-specific navigation links
- **Top bar**: University name/logo left, notification bell (with unread count badge) + user avatar/name + logout right
- **Main content area**: Breadcrumbs + page content
- Sidebar collapses to icons on mobile

---

## Pages by Role

---

### STUDENT Portal

#### Dashboard (`/dashboard/student`)
- Welcome card: "Hello, [Name]" + student ID + enrollment status badge (Active / Expired)
- Quick stats row: Upcoming appointments, Pending invoices, Unread notifications
- Recent appointments table (last 3)
- Recent lab results (last 3) — status badges (pending / completed)
- Unpaid invoices alert banner if any exist

#### My Appointments (`/dashboard/student/appointments`)
- Table of all appointments: date, doctor name, department, status badge, reason
- "Book Appointment" button → opens a slide-over / modal form:
  - Select doctor (dropdown — only shows active doctors with schedules)
  - Pick date (date picker — highlights available days based on doctor schedule)
  - Time (auto-filled based on schedule)
  - Reason (textarea)
- Status badges: `scheduled` (blue), `confirmed` (teal), `completed` (green), `cancelled` (red), `no_show` (gray)

#### My Consultations (`/dashboard/student/consultations`)
- Table: date, doctor, notes preview, linked prescription badge
- Click row to expand: full notes, prescriptions, lab tests ordered

#### My Prescriptions (`/dashboard/student/prescriptions`)
- Cards or table: date, diagnosis, medicines list, lab tests ordered
- Clean medicine list with dosage, frequency, days

#### My Lab Results (`/dashboard/student/lab-results`)
- Table: test name, ordered date, status, result value, resulted date
- Status badges: `pending` (amber), `in_progress` (blue), `completed` (green), `cancelled` (red)
- If completed: show result value prominently. No internal notes shown to student.
- If PDF attached: "Download Report" button

#### My Invoices (`/dashboard/student/invoices`)
- Cards per invoice: date, total amount, status badge, line items expandable
- "Pay Now" button on pending invoices → confirmation modal showing amount + mock payment flow:
  - Fake "Processing payment..." loading state (1.5 second delay)
  - Success or failure result (90/10 split as backend implements)
  - On success: invoice status updates to paid

#### Profile (`/dashboard/student/profile`)
- View: name, email, student ID, phone, enrollment period, blood group, allergies
- "Edit Profile" → form for phone, emergency contact
- "Change Profile Picture" → file upload (image only, max 5MB)
- "Change Password" form

---

### DOCTOR Portal

#### Dashboard (`/dashboard/doctor`)
- Today's schedule: appointments for today in a timeline/list view
- Quick stats: Today's consultations, Pending lab results from my patients
- Recent consultations list

#### My Schedule (`/dashboard/doctor/schedule`)
- Weekly calendar view of appointments
- Click appointment → view patient details, open consultation button (if not yet opened)

#### Consultations (`/dashboard/doctor/consultations`)
- List of consultations: patient name, date, notes status
- Click → full view: patient info, vitals recorded, prescriptions, lab results
- "Add Notes" button (inline edit, PATCH to backend)

#### Prescriptions (`/dashboard/doctor/prescriptions`)
- "New Prescription" button → multi-step form:
  1. Select consultation
  2. Chief complaint + diagnosis
  3. Add medicines (dynamic row add: name, dosage, frequency, days, instructions)
  4. Add lab tests (select from catalog or type free-text)
  5. Follow-up date
  6. Submit

#### Lab Results (`/dashboard/doctor/lab-results`)
- Table of all lab results for doctor's patients
- Filter by status
- View result values when completed

---

### NURSE Portal

#### Dashboard (`/dashboard/nurse`)
- Today's appointments overview
- Quick action buttons: "Record Walk-in", "Open Consultation", "Record Vitals"

#### Appointments (`/dashboard/nurse/appointments`)
- Full appointment list (all patients)
- "New Walk-in" button → creates appointment without pre-booking

#### Consultations (`/dashboard/nurse/consultations`)
- Open new consultation (link to appointment or walk-in)
- View active consultations

#### Vitals (`/dashboard/nurse/vitals`)
- Select consultation → form to record:
  - Blood pressure, Pulse, Temperature, Respiratory rate
  - Oxygen saturation, Blood glucose
  - Weight (kg), Height (cm)
  - BMI shown as calculated (read-only display)
- On submit: success toast + note that invoice has been auto-generated

---

### LAB TECHNICIAN Portal

#### Dashboard (`/dashboard/lab`)
- Queue: pending + in-progress lab tests
- Stats: completed today, pending total

#### Lab Queue (`/dashboard/lab/queue`)
- Table: patient name, test name, ordered by (doctor), ordered date, status
- Click row → "Update Result" slide-over:
  - Result value (text input)
  - Result notes (textarea)
  - Status dropdown: `in_progress` → `completed` or `cancelled`
  - Upload PDF report (optional)
  - Resulted at (datetime — auto-filled to now, editable)

---

### RECEPTIONIST Portal

#### Dashboard (`/dashboard/reception`)
- Today's appointments: full list, status management
- Quick actions: "New Appointment", "Open Walk-in", "Manage Invoices"

#### Appointments (`/dashboard/reception/appointments`)
- Full CRUD on appointments
- Status update dropdown per row (confirm, cancel, mark no-show)
- Cancellation reason field appears when cancelling

#### Invoices (`/dashboard/reception/invoices`)
- All invoices table: student, date, total, status
- Click invoice → detail view:
  - Line items list
  - "Add Line Item" button → modal: select service from catalog or manual entry, quantity, price
  - Status update: waive / cancel with notes
- Filter by status (pending / paid / waived / cancelled)

---

### ADMIN Portal

#### Dashboard (`/dashboard/admin`)
- System stats: total students, active students, staff count, today's appointments
- Recent audit log entries (last 10)
- Revenue summary chart (monthly invoices paid — bar chart using Recharts)

#### Students (`/dashboard/admin/students`)
- Full student list with search and filter
- Activate / deactivate toggle
- View full student profile
- Create new student

#### Staff Management (`/dashboard/admin/staff`)
- Staff list: name, role badge, department, status
- Create / edit / deactivate staff
- Assign departments and roles

#### Departments (`/dashboard/admin/departments`)
- Simple CRUD table: name, description, staff count
- Create / edit / delete modals

#### Schedules (`/dashboard/admin/schedules`)
- Select staff member → view/edit their weekly schedule
- Grid showing Mon–Sun with time slots

#### Services Catalog (`/dashboard/admin/services`)
- Fee catalog: service name, category badge, unit price, active/inactive toggle
- Create / edit services

#### Notifications (`/dashboard/admin/notifications`)
- Create system-wide notification (broadcast to all students, all staff, or specific user)
- Notification history table

#### Audit Logs (`/dashboard/admin/audit-logs`)
- Read-only paginated table
- Columns: timestamp, actor (type + ID), action, table affected, record ID
- Expandable row: shows `old_value` and `new_value` as formatted JSON diff
- Filter by actor type, action, date range

---

## Shared Components to Build

```
components/
├── layout/
│   ├── Sidebar.tsx           ← role-aware nav links
│   ├── TopBar.tsx            ← notifications bell, user menu
│   └── DashboardLayout.tsx
├── ui/
│   ├── StatusBadge.tsx       ← reusable colored badge for statuses
│   ├── DataTable.tsx         ← reusable sortable/paginated table
│   ├── ConfirmModal.tsx      ← "Are you sure?" dialog
│   ├── SlideOver.tsx         ← right-side drawer for forms
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx        ← "No records found" placeholder
│   └── PageHeader.tsx        ← title + breadcrumbs + action button
├── forms/
│   ├── AppointmentForm.tsx
│   ├── VitalsForm.tsx
│   ├── PrescriptionForm.tsx
│   └── ProfilePictureUpload.tsx
└── notifications/
    └── NotificationDropdown.tsx  ← bell icon dropdown, mark as read
```

---

## API Client (`lib/api.ts`)

```typescript
// Axios instance with base URL and JWT interceptor
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

// Attach JWT from Zustand store to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: clear auth state and redirect to /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

---

## Auth Store (`store/authStore.ts`)

```typescript
interface AuthState {
  token: string | null;
  user: { id: number; role: string; type: string; name: string } | null;
  login: (token: string) => void;
  logout: () => void;
}
```

Persist to `sessionStorage` (not localStorage) so session ends on tab close.

---

## TypeScript Types (`types/`)

Mirror every backend DTO as a TypeScript interface. Examples:

```typescript
// types/appointment.ts
interface Appointment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorName: string;
  department: string;
  scheduledTime: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  cancellationReason?: string;
}

// types/invoice.ts
interface Invoice {
  invoiceId: number;
  invoiceDate: string;
  totalAmount: number;
  transactionStatus: 'pending' | 'paid' | 'waived' | 'cancelled';
  lineItems: InvoiceLineItem[];
}
```

---

## Environment Variables (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Docker (`frontend/Dockerfile`)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## UX Details to Get Right

- **Loading states:** Every table and form should show a spinner or skeleton while fetching
- **Toast notifications:** Success and error toasts after every action (use shadcn/ui Toast)
- **Empty states:** When a list is empty, show a friendly illustration + message (not a blank table)
- **Form validation:** Inline field errors, not just an alert at the top
- **Responsive:** Works on mobile — sidebar collapses, tables become cards on small screens
- **Dates:** Always display in a human-readable format: "Mon, 15 Jan 2024 at 10:30 AM"
- **Currency:** Format as "৳ 1,200.00" (Bangladeshi Taka — or adapt to your locale)
- **Status badges:** Consistent colors across all pages (same color for `pending` everywhere, etc.)
- **Confirmation dialogs:** Any destructive action (cancel appointment, deactivate student, pay invoice) needs a confirm modal first

---

## Pages That Don't Exist Yet (Nice to Add Later)

- `/dashboard/student/medical-history` — view conditions recorded by doctors
- `/dashboard/doctor/patient/{id}` — full patient profile view for a doctor
- `/dashboard/admin/analytics` — deeper charts and stats
- Landing page at `/` — simple marketing page before login

---

## What NOT to Build

- No dark mode (keep it simple for portfolio)
- No i18n / multi-language
- No PWA / service workers
- No real-time WebSocket updates (poll or manual refresh)
- No payment UI beyond the mock flow already described
- No SMS, no push notifications
