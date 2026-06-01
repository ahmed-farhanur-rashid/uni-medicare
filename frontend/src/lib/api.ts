import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export interface LoginRequest {
  eId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  role: string;
  type: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  role: string;
  specialty?: string;
  department?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  issuedOn?: string;
  expiresOn?: string;
}

export interface StudentResponse {
  studentId: number;
  name: string;
  email: string;
  phone: string;
  issuedOn: string;
  expiresOn: string;
  isActive: boolean;
  emailVerified: boolean;
  accountId: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalStaffResponse {
  medicalStaffId: number;
  roleName: string;
  canPrescribe: boolean;
  departmentName: string;
  name: string;
  email: string;
  phone: string;
  specialty: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentResponse {
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  department: string;
  scheduledTime: string;
  reason: string;
  status: string;
  cancellationReason: string;
  createdAt: string;
}

export interface ConsultationResponse {
  consultId: number;
  patientId: number;
  patientName: string;
  staffId: number;
  staffName: string;
  appointmentId: number;
  consultTime: string;
  notes: string;
}

export interface VitalSignsResponse {
  consultId: number;
  bp: string;
  pulse: number;
  temp: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  bloodGlucose: number;
  weight: number;
  height: number;
  bmi: number;
}

export interface PrescriptionResponse {
  prescriptionId: number;
  consultId: number;
  prescriptionDate: string;
  chiefComplaint: string;
  diagnosis: string;
  followUpDate: string;
  labTests: LabTestItem[];
}

export interface LabTestItem {
  labTestId: number;
  labTestName: string;
  catalogId: number;
}

export interface LabResultResponse {
  resultId: number;
  labTestId: number;
  labTestName: string;
  performedById: number;
  performedByName: string;
  resultValue: string;
  resultNotes: string;
  resultStatus: string;
  resultedAt: string;
  uploadId: number;
  createdAt: string;
}

export interface InvoiceResponse {
  invoiceId: number;
  invoiceDate: string;
  totalAmount: number;
  transactionStatus: string;
  consultId: number;
  studentId: number;
  studentName: string;
  transactionId: number;
  notes: string;
  lineItems: LineItem[];
  updatedAt: string;
}

export interface LineItem {
  lineItemId: number;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface NotificationResponse {
  notificationId: number;
  recipientType: string;
  recipientId: number;
  title: string;
  message: string;
  isRead: boolean;
  channel: string;
  readAt: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Department {
  departmentId: number;
  name: string;
  description: string;
}

export interface Role {
  roleId: number;
  roleName: string;
  canPrescribe: boolean;
}

export interface Service {
  serviceId: number;
  serviceName: string;
  category: string;
  unitPrice: number;
  description: string;
  isActive: boolean;
}

export interface AuditLog {
  logId: number;
  actorType: string;
  actorId: number;
  action: string;
  tableName: string;
  recordId: number;
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

// Auth API
export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: {
    studentId: number;
    name: string;
    email?: string;
    phone?: string;
    password: string;
    dateOfBirth: string;
    bloodgroup?: string;
    sex?: string;
  }) => api.post<{ message: string; verificationUrl: string }>('/auth/register', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  getProfile: () => api.get<ProfileResponse>('/me'),
  updateProfile: (data: Record<string, string>) => api.put('/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/me/password', { currentPassword, newPassword }),
};

// Appointments API
export const appointmentsApi = {
  getAll: () => api.get<AppointmentResponse[]>('/appointments'),
  getMy: () => api.get<AppointmentResponse[]>('/appointments/my'),
  create: (data: {
    patientId?: number;
    doctorId: number;
    scheduledTime: string;
    reason: string;
  }) => api.post<AppointmentResponse>('/appointments', data),
  updateStatus: (
    id: number,
    data: { status: string; reason?: string }
  ) => api.patch(`/appointments/${id}/status`, data),
};

// Consultations API
export const consultationsApi = {
  getMy: () => api.get<ConsultationResponse[]>('/consultations/my'),
  create: (data: {
    patientId: number;
    staffId: number;
    appointmentId?: number;
  }) => api.post<ConsultationResponse>('/consultations', data),
  updateNotes: (id: number, notes: string) =>
    api.patch(`/consultations/${id}/notes`, { notes }),
};

// Vitals API
export const vitalsApi = {
  getByConsultation: (consultId: number) =>
    api.get<VitalSignsResponse>(`/vitals/${consultId}`),
  create: (
    consultId: number,
    data: Omit<VitalSignsResponse, 'consultId' | 'bmi'>
  ) => api.post(`/vitals/${consultId}`, data),
};

// Prescriptions API
export const prescriptionsApi = {
  getById: (id: number) =>
    api.get<PrescriptionResponse>(`/prescriptions/${id}`),
  create: (data: {
    consultId: number;
    chiefComplaint: string;
    diagnosis: string;
    followUpDate?: string;
  }) => api.post<PrescriptionResponse>('/prescriptions', data),
  addLabTest: (id: number, data: { catalogId?: number; labTestName?: string }) =>
    api.post(`/prescriptions/${id}/lab-tests`, data),
};

// Lab Results API
export const labResultsApi = {
  getByPrescription: (prescriptionId: number) =>
    api.get<LabResultResponse[]>(`/lab-results/prescription/${prescriptionId}`),
  getMy: () => api.get<LabResultResponse[]>('/lab-results/my'),
  update: (
    resultId: number,
    data: {
      resultValue?: string;
      resultNotes?: string;
      resultStatus?: string;
    }
  ) => api.patch(`/lab-results/${resultId}`, data),
};

// Billing API
export const billingApi = {
  getMyInvoices: () => api.get<InvoiceResponse[]>('/billing/invoices/my'),
  pay: (invoiceId: number) =>
    api.post<{ success: boolean; message: string }>(
      `/billing/invoices/${invoiceId}/pay`
    ),
  addLineItem: (
    invoiceId: number,
    data: {
      serviceId: number;
      description: string;
      quantity: number;
      unitPrice: number;
    }
  ) => api.post(`/billing/invoices/${invoiceId}/line-items`, data),
  updateStatus: (invoiceId: number, status: string) =>
    api.patch(`/billing/invoices/${invoiceId}/status`, { status }),
};

// Notifications API
export const notificationsApi = {
  getMy: () => api.get<NotificationResponse[]>('/notifications/my'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
};

// Uploads API
export const uploadsApi = {
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ uploadId: number; originalName: string }>(
      '/uploads/profile-picture',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
  uploadLabResult: (resultId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/uploads/lab-result/${resultId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUrl: (uploadId: number) => `${API_BASE}/api/uploads/${uploadId}`,
};

// Doctors API
export interface DoctorResponse {
  id: number;
  name: string;
  specialty: string;
  department: string;
  email: string;
  phone: string;
}

export interface StaffScheduleResponse {
  scheduleId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface DepartmentScheduleResponse {
  scheduleId: number;
  departmentId: number;
  departmentName: string;
  slotDurationMinutes: number;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  isBookable: boolean;
}

export interface SlotResponse {
  time: string;
  endTime: string;
  status: 'available' | 'booked' | 'break';
}

export const doctorsApi = {
  getSpecialties: () => api.get<string[]>('/doctors/specialties'),
  getAll: (specialty?: string) =>
    api.get<DoctorResponse[]>('/doctors', { params: specialty ? { specialty } : {} }),
  getSchedule: (id: number) => api.get<StaffScheduleResponse[]>(`/doctors/${id}/schedule`),
  getAvailableSlots: (id: number, date: string) =>
    api.get<SlotResponse[]>(`/doctors/${id}/available-slots`, { params: { date } }),
};

// Admin API
export const adminApi = {
  // Admin verification
  verifyPassword: (password: string) =>
    api.post<{ valid: boolean }>('/admin/verify/password', { password }),

  // Students
  getStudents: (page = 0, size = 20) =>
    api.get<PaginatedResponse<StudentResponse>>(
      `/admin/students?page=${page}&size=${size}`
    ),
  getStudent: (id: number) =>
    api.get<StudentResponse>(`/admin/students/${id}`),
  createStudent: (data: Partial<StudentResponse> & { password: string }) =>
    api.post<StudentResponse>('/admin/students', data),
  updateStudent: (id: number, data: Partial<StudentResponse>) =>
    api.put<StudentResponse>(`/admin/students/${id}`, data),
  toggleStudentActive: (id: number) =>
    api.patch<StudentResponse>(`/admin/students/${id}/activate`),
  deleteStudent: (id: number) => api.delete(`/admin/students/${id}`),

  // Staff
  getStaff: () => api.get<MedicalStaffResponse[]>('/admin/staff'),
  getStaffMember: (id: number) =>
    api.get<MedicalStaffResponse>(`/admin/staff/${id}`),
  createStaff: (data: Partial<MedicalStaffResponse> & { password: string }) =>
    api.post<MedicalStaffResponse>('/admin/staff', data),
  updateStaff: (
    id: number,
    data: Partial<MedicalStaffResponse> & { password?: string }
  ) => api.put<MedicalStaffResponse>(`/admin/staff/${id}`, data),
  deleteStaff: (id: number) => api.delete(`/admin/staff/${id}`),

  // Departments
  getDepartments: () => api.get<Department[]>('/admin/departments'),
  getDepartment: (id: number) =>
    api.get<Department>(`/admin/departments/${id}`),
  createDepartment: (data: { name: string; description: string }) =>
    api.post<Department>('/admin/departments', data),
  updateDepartment: (
    id: number,
    data: { name: string; description: string }
  ) => api.put<Department>(`/admin/departments/${id}`, data),
  deleteDepartment: (id: number) => api.delete(`/admin/departments/${id}`),

  // Roles
  getRoles: () => api.get<Role[]>('/admin/roles'),
  getRole: (id: number) => api.get<Role>(`/admin/roles/${id}`),
  createRole: (data: { roleName: string; canPrescribe: boolean }) =>
    api.post<Role>('/admin/roles', data),
  updateRole: (id: number, data: { roleName: string; canPrescribe: boolean }) =>
    api.put<Role>(`/admin/roles/${id}`, data),
  deleteRole: (id: number) => api.delete(`/admin/roles/${id}`),

  // Services
  getServices: (page = 0, size = 20) =>
    api.get<PaginatedResponse<Service>>(
      `/admin/services?page=${page}&size=${size}`
    ),
  getService: (id: number) => api.get<Service>(`/admin/services/${id}`),
  createService: (data: Omit<Service, 'serviceId'>) =>
    api.post<Service>('/admin/services', data),
  updateService: (id: number, data: Partial<Service>) =>
    api.put<Service>(`/admin/services/${id}`, data),
  toggleServiceActive: (id: number) =>
    api.patch<Service>(`/admin/services/${id}/toggle`),
  deleteService: (id: number) => api.delete(`/admin/services/${id}`),

  // Schedules
  getSchedules: () => api.get('/admin/schedules'),
  createSchedule: (data: {
    medicalStaffId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => api.post('/admin/schedules', data),
  updateSchedule: (
    id: number,
    data: { dayOfWeek: number; startTime: string; endTime: string }
  ) => api.put(`/admin/schedules/${id}`, data),
  deleteSchedule: (id: number) => api.delete(`/admin/schedules/${id}`),

  // Department schedules
  getDepartmentSchedules: () => api.get<DepartmentScheduleResponse[]>('/admin/department-schedules'),
  getDepartmentSchedule: (departmentId: number) =>
    api.get<DepartmentScheduleResponse>(`/admin/department-schedules/${departmentId}`),
  updateDepartmentSchedule: (
    departmentId: number,
    data: Partial<DepartmentScheduleResponse>
  ) => api.put<DepartmentScheduleResponse>(`/admin/department-schedules/${departmentId}`, data),
  deleteDepartmentSchedule: (departmentId: number) =>
    api.delete(`/admin/department-schedules/${departmentId}`),
};

// Audit API
export const auditApi = {
  getLogs: (page = 0, size = 20) =>
    api.get<PaginatedResponse<AuditLog>>(
      `/audit-logs?page=${page}&size=${size}`
    ),
};

export default api;
