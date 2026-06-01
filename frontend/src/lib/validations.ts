import { z } from 'zod';

export const loginSchema = z.object({
  eId: z.string().min(1, 'Email or ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').regex(/^\d+$/, 'Student ID must be a number'),
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  bloodgroup: z.string().optional().or(z.literal('')),
  sex: z.string().optional().or(z.literal('')),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleName: z.string().min(1, 'Role is required'),
  departmentName: z.string().min(1, 'Department is required'),
  specialty: z.string().optional().or(z.literal('')),
});

export const createStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').regex(/^\d+$/, 'Must be a number'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional().or(z.literal('')),
});

export const createServiceSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().optional().or(z.literal('')),
});

export const bookAppointmentSchema = z.object({
  specialty: z.string().min(1, 'Please select a specialty'),
  doctorId: z.string().min(1, 'Please select a doctor'),
  scheduledTime: z.string().min(1, 'Please select a date and time'),
  reason: z.string().optional().or(z.literal('')),
});
