'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from './types';
import { supabase } from '@/lib/supabase/client';
import { createInternshipEnrollment, getActiveDomains } from '@/lib/supabase/queries';

interface AuthContextType {
  user: UserProfile | null;
  role: 'student' | 'admin' | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; role?: string }) => Promise<{ role: string; redirect: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    college?: string;
    graduation_year?: string;
    domain?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'student' | 'admin' | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      setUser(null);
      setRole(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (profile.role === 'admin') {
        setRole('admin');
        setUser({
          name: profile.full_name || 'InternJourneys Admin',
          initials: profile.initials || 'AD',
          internId: 'ADMIN',
          domain: 'Platform Administration',
          joinedOn: '2026',
          status: 'Active',
          totalInternships: 1,
          completedInternships: 0,
          email: session.user.email || '',
          phone: profile.phone || '',
          college: profile.college || '',
          graduationYear: profile.graduation_year || ''
        });
      } else {
        const { data: enrollment } = await supabase
          .from('internship_enrollments')
          .select('status, start_date, domains(name, duration_weeks)')
          .eq('student_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        const enrollmentDomain = Array.isArray(enrollment?.domains)
          ? enrollment.domains[0]
          : enrollment?.domains;

        setRole('student');
        setUser({
          name: profile.full_name,
          initials: profile.initials || profile.full_name?.slice(0, 2).toUpperCase() || 'CA',
          internId: `CAI-${session.user.id.slice(0, 8).toUpperCase()}`,
          domain: enrollmentDomain?.name || 'Not Enrolled',
          joinedOn: enrollment?.start_date || new Date(session.user.created_at).toLocaleDateString(),
          status: enrollment?.status === 'COMPLETED' ? 'Completed' : 'Active',
          totalInternships: enrollment ? 1 : 0,
          completedInternships: enrollment?.status === 'COMPLETED' ? 1 : 0,
          email: session.user.email || '',
          phone: profile.phone || '',
          college: profile.college || '',
          graduationYear: profile.graduation_year || '',
          durationWeeks: enrollmentDomain?.duration_weeks || undefined
        });
      }
      setToken(session.access_token);
    } catch (err) {
      console.warn('Could not restore auth session:', err);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async ({ email, password, role: selectedRole }: { email: string; password: string; role?: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    await fetchCurrentUser();

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    const resolvedRole = profile?.role === 'admin' ? 'admin' : 'student';
    const redirect = resolvedRole === 'admin' ? '/admin' : '/dashboard';
    return { role: selectedRole || resolvedRole, redirect };
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    college?: string;
    graduation_year?: string;
    domain?: string;
  }) => {
    const initials = formData.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          initials,
          role: 'student',
          phone: formData.phone || null,
          college: formData.college || null,
          graduation_year: formData.graduation_year || null,
        },
      },
    });

    let session = data.session;
    let recoveredExistingAccount = false;
    if (error) {
      const isAlreadyRegistered = error.message.toLowerCase().includes('already registered');
      const isEmailRateLimit = error.message.toLowerCase().includes('email rate limit');

      if (isAlreadyRegistered || isEmailRateLimit) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          if (isAlreadyRegistered) throw signInError;
          throw new Error(
            'Signup is blocked by Supabase email limits. Turn off Confirm email in Supabase Authentication settings, then try again.'
          );
        }

        if (!signInData.session) throw new Error('Could not start a session for this account.');
        session = signInData.session;
        recoveredExistingAccount = isAlreadyRegistered;
      } else {
        throw error;
      }
    }

    if (!session) {
      if (!data.user) throw new Error('Registration did not return a Supabase user.');

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) {
        throw new Error('Account created, but Supabase did not return a login session. Turn off Confirm email in Supabase Authentication settings for normal signup.');
      }
      session = signInData.session;
    }
    if (!session) throw new Error('Registration did not return an authenticated session.');

    const domains = await getActiveDomains();
    const selectedDomain = domains.find((domain) => domain.name === formData.domain || domain.slug === formData.domain);
    if (selectedDomain) {
      try {
        await createInternshipEnrollment(selectedDomain.id);
      } catch (enrollmentError) {
        const message = enrollmentError instanceof Error
          ? enrollmentError.message
          : enrollmentError && typeof enrollmentError === 'object' && 'message' in enrollmentError
            ? String(enrollmentError.message)
            : '';
        if (!recoveredExistingAccount || !message.includes('already have an active internship')) {
          throw enrollmentError;
        }
      }
    }

    setToken(session?.access_token || null);
    setRole('student');

    await fetchCurrentUser();
  };

  const logout = () => {
    supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('careerai_cache_dashboard_user');
      sessionStorage.removeItem('careerai_cache_dashboard_tasks');
    }
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
