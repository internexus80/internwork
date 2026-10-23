'use client';

import { supabase } from './client';
import { DomainRow, StudentTaskRow, TaskRow, mapStudentTask } from './types';
import type { PlatformStats, UserProfile, InternshipApplication, ApplicationStatus, AdminPayment, StudentCertificateAccess, AdminCertificateAccess } from '@/lib/types';

export async function getActiveDomains() {
  const response = await fetch('/api/domains', { cache: 'no-store' });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Could not load internship domains.');
  return (payload || []) as DomainRow[];
}

export async function getDomainBySlug(slug: string) {
  const response = await fetch(`/api/domains/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Could not load this domain.');
  return payload as DomainRow;
}

export async function invalidateDomainCache(slug?: string) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const response = await fetch('/api/cache/invalidate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slug }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Could not invalidate domain cache.');
  }
}

export async function createInternshipEnrollment(domainId: string) {
  const { data, error } = await supabase.rpc('create_internship_enrollment', {
    requested_domain_id: domainId,
  });

  if (error) throw error;
  return data;
}

export async function getStudentTasks() {
  const { data, error } = await supabase
    .from('student_tasks')
    .select('*, tasks(*)')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return ((data || []) as StudentTaskRow[]).map(mapStudentTask);
}

export async function submitStudentTask(studentTaskId: string, submission: { url?: string; text?: string }) {
  const { error } = await supabase.rpc('submit_student_task', {
    target_student_task_id: studentTaskId,
    p_submission_url: submission.url || null,
    p_submission_text: submission.text || null,
  });

  if (error) throw error;
}

export async function getAdminDomains() {
  const { data, error } = await supabase
    .from('domains')
    .select('*, domain_skills(*), tasks(id)')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data || []) as DomainRow[];
}

export async function upsertAdminDomain(domain: Partial<DomainRow> & { skills?: string[] }) {
  const previousSlug = domain.slug;
  const payload = {
    slug: domain.slug,
    name: domain.name,
    short_description: domain.short_description,
    description: domain.description,
    level: domain.level,
    duration_weeks: domain.duration_weeks,
    duration_label: domain.duration_label,
    icon: domain.icon,
    color: domain.color,
    is_active: domain.is_active,
    display_order: domain.display_order,
  };

  const { data, error } = domain.id
    ? await supabase.from('domains').update(payload).eq('id', domain.id).select().single()
    : await supabase.from('domains').insert(payload).select().single();

  if (error) throw error;

  if (domain.skills) {
    const { error: deleteSkillsError } = await supabase
      .from('domain_skills')
      .delete()
      .eq('domain_id', data.id);
    if (deleteSkillsError) throw deleteSkillsError;

    const { error: skillError } = await supabase.from('domain_skills').insert(
      domain.skills.map((skill, index) => ({
        domain_id: data.id,
        skill_name: skill,
        display_order: index,
      }))
    );
    if (skillError) throw skillError;
  }

  await invalidateDomainCache(previousSlug || data.slug);

  return data as DomainRow;
}

export async function getTasksForDomain(domainId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('domain_id', domainId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data || []) as TaskRow[];
}

export async function upsertAdminTask(task: Partial<TaskRow>) {
  let domainSlug: string | undefined;
  if (task.domain_id) {
    const { data: domain } = await supabase.from('domains').select('slug').eq('id', task.domain_id).single();
    domainSlug = domain?.slug;
  }

  const { data, error } = task.id
    ? await supabase.from('tasks').update(task).eq('id', task.id).select().single()
    : await supabase.from('tasks').insert(task).select().single();

  if (error) throw error;
  await invalidateDomainCache(domainSlug);
  return data as TaskRow;
}

function unwrap<T>(data: unknown, fn: string): T {
  if (data && typeof data === 'object' && !Array.isArray(data) && fn in data) {
    return (data as Record<string, unknown>)[fn] as T;
  }
  return data as T;
}

interface AdminStudentOverviewRow {
  id: string;
  full_name: string | null;
  initials: string | null;
  domain: string | null;
  start_date: string | null;
  enrollment_status: string | null;
  email: string | null;
  phone: string | null;
  college: string | null;
  graduation_year: string | null;
}

interface AdminSubmissionOverviewRow {
  id: string;
  student_name: string | null;
  email: string | null;
  task_title: string | null;
  domain_name: string | null;
  submitted_at: string | null;
  status: string;
}

interface AdminPaymentOverviewRow {
  id: string;
  student_name: string | null;
  purpose: string | null;
  amount: number | string | null;
  currency: string | null;
  status: string | null;
  created_at: string | null;
  provider_payment_id: string | null;
  provider_order_id: string | null;
}

function initialsOf(name: string | null): string {
  return (name || '').split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'ST';
}

function studentStatusFromEnrollment(status: string | null): UserProfile['status'] {
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'ACTIVE') return 'Active';
  return 'Inactive';
}

function toApplicationStatus(status: string): ApplicationStatus {
  if (status === 'VERIFIED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'SUBMITTED') return 'In Review';
  return 'Pending';
}

export async function getAdminPlatformStats(): Promise<PlatformStats> {
  const { data, error } = await supabase.rpc('admin_dashboard_stats');
  if (error) throw error;
  return unwrap<PlatformStats>(data, 'admin_dashboard_stats');
}

export async function getAdminStudents(): Promise<UserProfile[]> {
  const { data, error } = await supabase.rpc('admin_student_overview');
  if (error) throw error;
  const rows = unwrap<AdminStudentOverviewRow[] | null>(data, 'admin_student_overview') || [];

  return rows.map((r) => ({
    id: r.id,
    name: r.full_name || 'Student',
    initials: r.initials || initialsOf(r.full_name),
    internId: `CAI-${r.id.slice(0, 8).toUpperCase()}`,
    domain: r.domain || 'Not Enrolled',
    joinedOn: r.start_date || '—',
    status: studentStatusFromEnrollment(r.enrollment_status),
    totalInternships: r.enrollment_status ? 1 : 0,
    completedInternships: r.enrollment_status === 'COMPLETED' ? 1 : 0,
    email: r.email || '',
    phone: r.phone || '',
    college: r.college || '',
    graduationYear: r.graduation_year || '',
  }));
}

export async function setStudentEnrollmentStatus(userId: string, active: boolean) {
  const status = active ? 'ACTIVE' : 'CANCELLED';
  const { error } = await supabase
    .from('internship_enrollments')
    .update({ status })
    .eq('student_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
}

export async function getAdminSubmissions(): Promise<InternshipApplication[]> {
  const { data, error } = await supabase.rpc('admin_submission_overview');
  if (error) throw error;
  const rows = unwrap<AdminSubmissionOverviewRow[] | null>(data, 'admin_submission_overview') || [];
  return rows.map((r) => ({
    id: r.id,
    studentName: r.student_name || 'Student',
    studentInitials: initialsOf(r.student_name),
    email: r.email || '',
    domain: r.task_title || r.domain_name || 'Task',
    appliedOn: r.submitted_at || '—',
    status: toApplicationStatus(r.status),
  }));
}

export async function reviewSubmission(studentTaskId: string, approved: boolean, reason?: string) {
  const { error } = await supabase.rpc('verify_student_task', {
    target_student_task_id: studentTaskId,
    approved,
    reason: reason || null,
  });
  if (error) throw error;
}

export async function getAdminPayments(): Promise<AdminPayment[]> {
  const { data, error } = await supabase.rpc('admin_payment_overview');
  if (error) throw error;
  const rows = unwrap<AdminPaymentOverviewRow[] | null>(data, 'admin_payment_overview') || [];
  return rows.map((r) => ({
    id: r.id,
    studentName: r.student_name || 'Student',
    internId: `CAI-${'X'}`,
    purpose: r.purpose || '',
    amount: Number(r.amount) || 0,
    currency: r.currency || 'INR',
    status: r.status === 'Completed' || r.status === 'Failed' || r.status === 'Refunded'
      ? r.status
      : 'Pending',
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    transactionId: r.provider_payment_id || r.provider_order_id || undefined,
  }));
}

export async function updatePaymentStatus(paymentId: string, status: string) {
  const { error } = await supabase
    .from('payments')
    .update({ status, ...(status === 'Completed' ? { paid_at: new Date().toISOString() } : {}) })
    .eq('id', paymentId);
  if (error) throw error;
}

export async function verifyCertificateByCode(code: string): Promise<{ valid: boolean; status?: string; certificate_id?: string; issue_date?: string; start_date?: string; end_date?: string; student_name?: string; domain?: string }> {
  const { data, error } = await supabase.rpc('verify_certificate_by_code', { p_code: code });
  if (error) throw error;
  return unwrap(data, 'verify_certificate_by_code');
}

export async function issueCertificateForCurrentStudent(): Promise<StudentCertificateAccess> {
  const verificationBaseUrl = typeof window === 'undefined'
    ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}/verify`
    : `${window.location.origin}/verify`;
  const { data, error } = await supabase.rpc('get_student_certificate_access', {
    p_verification_base_url: verificationBaseUrl,
  });
  if (error) throw error;
  return unwrap<StudentCertificateAccess>(data, 'get_student_certificate_access');
}

export async function getAdminCertificateAccess(): Promise<AdminCertificateAccess[]> {
  const { data, error } = await supabase.rpc('admin_certificate_access_overview');
  if (error) throw error;
  return unwrap<AdminCertificateAccess[]>(data, 'admin_certificate_access_overview');
}

export async function setAdminCertificateAccess(studentId: string, enabled: boolean, note = '') {
  const { error } = await supabase.rpc('set_certificate_access_override', {
    p_student_id: studentId,
    p_enabled: enabled,
    p_note: note,
    p_verification_base_url: `${window.location.origin}/verify`,
  });
  if (error) throw error;
}

export async function getIssuedCertificatesAdmin() {
  const { data, error } = await supabase
    .from('certificates')
    .select('certificate_id, issue_date, status, student_id, domain_id')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const certificates = data || [];
  const studentIds = certificates.map((certificate) => certificate.student_id).filter(Boolean);
  const domainIds = certificates.map((certificate) => certificate.domain_id).filter(Boolean);
  const [{ data: profiles, error: profilesError }, { data: domains, error: domainsError }] = await Promise.all([
    supabase.from('profiles').select('id, full_name').in('id', studentIds),
    supabase.from('domains').select('id, name').in('id', domainIds),
  ]);
  if (profilesError) throw profilesError;
  if (domainsError) throw domainsError;
  return certificates.map((certificate) => ({
    ...certificate,
    student_name: profiles?.find((profile) => profile.id === certificate.student_id)?.full_name || '',
    domain_name: domains?.find((domain) => domain.id === certificate.domain_id)?.name || '',
  }));
}
