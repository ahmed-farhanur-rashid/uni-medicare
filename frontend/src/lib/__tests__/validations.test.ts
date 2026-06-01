import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, bookAppointmentSchema } from '../validations';

describe('loginSchema', () => {
  it('rejects empty eId', () => {
    const result = loginSchema.safeParse({ eId: '', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ eId: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects both empty', () => {
    const result = loginSchema.safeParse({ eId: '', password: '' });
    expect(result.success).toBe(false);
  });

  it('accepts valid data', () => {
    const result = loginSchema.safeParse({ eId: 'user@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('accepts numeric eId', () => {
    const result = loginSchema.safeParse({ eId: '12345', password: 'password123' });
    expect(result.success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('rejects empty studentId', () => {
    const result = registerSchema.safeParse({
      studentId: '',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      dateOfBirth: '2000-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric studentId', () => {
    const result = registerSchema.safeParse({
      studentId: 'abc123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      dateOfBirth: '2000-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: 'J',
      email: 'john@example.com',
      password: 'password123',
      dateOfBirth: '2000-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: '',
      email: 'john@example.com',
      password: 'password123',
      dateOfBirth: '2000-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123',
      dateOfBirth: '2000-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: 'John Doe',
      email: 'john@example.com',
      password: '1234567',
      dateOfBirth: '2000-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: 'John Doe',
      email: 'john@example.com',
      password: '',
      dateOfBirth: '2000-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty dateOfBirth', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      dateOfBirth: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid data', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      password: 'password123',
      dateOfBirth: '2000-01-01',
      bloodgroup: 'O+',
      sex: 'Male',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty optional fields', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: 'John Doe',
      email: '',
      phone: '',
      password: 'password123',
      dateOfBirth: '2000-01-01',
      bloodgroup: '',
      sex: '',
    });
    expect(result.success).toBe(true);
  });

  it('accepts missing optional fields entirely', () => {
    const result = registerSchema.safeParse({
      studentId: '12345',
      name: 'John Doe',
      password: 'password123',
      dateOfBirth: '2000-01-01',
    });
    expect(result.success).toBe(true);
  });
});

describe('forgotPasswordSchema', () => {
  it('rejects empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects email without domain', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@' });
    expect(result.success).toBe(false);
  });

  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });
});

describe('resetPasswordSchema', () => {
  it('rejects short password', () => {
    const result = resetPasswordSchema.safeParse({
      password: '1234567',
      confirmPassword: '1234567',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = resetPasswordSchema.safeParse({
      password: '',
      confirmPassword: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'different123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts matching passwords of 8+ chars', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });
});

describe('bookAppointmentSchema', () => {
  it('rejects empty specialty', () => {
    const result = bookAppointmentSchema.safeParse({
      specialty: '',
      doctorId: 'doc-1',
      scheduledTime: '2026-06-01T10:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty doctorId', () => {
    const result = bookAppointmentSchema.safeParse({
      specialty: 'Cardiology',
      doctorId: '',
      scheduledTime: '2026-06-01T10:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty scheduledTime', () => {
    const result = bookAppointmentSchema.safeParse({
      specialty: 'Cardiology',
      doctorId: 'doc-1',
      scheduledTime: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects all empty', () => {
    const result = bookAppointmentSchema.safeParse({
      specialty: '',
      doctorId: '',
      scheduledTime: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid data', () => {
    const result = bookAppointmentSchema.safeParse({
      specialty: 'Cardiology',
      doctorId: 'doc-1',
      scheduledTime: '2026-06-01T10:00',
      reason: 'Annual checkup',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty optional reason', () => {
    const result = bookAppointmentSchema.safeParse({
      specialty: 'Cardiology',
      doctorId: 'doc-1',
      scheduledTime: '2026-06-01T10:00',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty string for optional reason', () => {
    const result = bookAppointmentSchema.safeParse({
      specialty: 'Cardiology',
      doctorId: 'doc-1',
      scheduledTime: '2026-06-01T10:00',
      reason: '',
    });
    expect(result.success).toBe(true);
  });
});
