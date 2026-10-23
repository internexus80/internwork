import { UserProfile, AdminUser } from './types';
import { mockUser } from '@/data/mockData';
import { adminUser } from '@/data/adminMockData';

const AUTH_KEY = 'careerai_user';
const LOGGED_IN_KEY = 'careerai_is_logged_in';
const ADMIN_LOGGED_IN_KEY = 'careerai_admin_is_logged_in';
const ADMIN_USER_KEY = 'careerai_admin_user';

const ADMIN_CREDENTIALS = {
  email: adminUser.email,
  password: adminUser.password ?? 'admin123',
};

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
}

export function setAdminLoggedIn(status: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_LOGGED_IN_KEY, status ? 'true' : 'false');
  }
}

export function getAdminUser(): AdminUser {
  if (typeof window === 'undefined') return adminUser;
  const stored = localStorage.getItem(ADMIN_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return adminUser;
    }
  }
  return adminUser;
}

export function validateAdminCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  );
}

export function getMockUser(): UserProfile {
  if (typeof window === 'undefined') return mockUser;
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return mockUser;
    }
  }
  return mockUser;
}

export function saveMockUser(user: Partial<UserProfile>): UserProfile {
  const current = getMockUser();
  const updated = { ...current, ...user };
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return true;
  const status = localStorage.getItem(LOGGED_IN_KEY);
  return status === null ? true : status === 'true';
}

export function setLoggedIn(status: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGGED_IN_KEY, status ? 'true' : 'false');
  }
}
