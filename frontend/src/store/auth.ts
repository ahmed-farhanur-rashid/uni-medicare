import { create } from 'zustand';
import { authApi, type LoginResponse } from '@/lib/api';

type UserRole = 'STUDENT' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'LAB_TECHNICIAN' | 'ADMIN';
type UserType = 'student' | 'staff';

interface AuthState {
  token: string | null;
  userId: number | null;
  role: UserRole | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (eId: number, password: string) => Promise<boolean>;
  logout: () => void;
  loadFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  role: null,
  userType: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (eId: number, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login({ eId, password });
      const data: LoginResponse = res.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          role: data.role,
          type: data.type,
        })
      );

      set({
        token: data.token,
        userId: data.id,
        role: data.role as UserRole,
        userType: data.type as UserType,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Login failed. Please try again.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      userId: null,
      role: null,
      userType: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          token,
          userId: user.id,
          role: user.role,
          userType: user.type,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  clearError: () => set({ error: null }),
}));

export function getDashboardPath(role: UserRole | null): string {
  switch (role) {
    case 'STUDENT':
      return '/student';
    case 'DOCTOR':
      return '/doctor';
    case 'NURSE':
      return '/nurse';
    case 'RECEPTIONIST':
      return '/receptionist';
    case 'LAB_TECHNICIAN':
      return '/lab';
    case 'ADMIN':
      return '/admin';
    default:
      return '/';
  }
}
