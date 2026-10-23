export type Dict = Record<string, unknown>;

export type TaskStatus = 'Completed' | 'Pending' | 'Available';

export interface Task {
  id: string;
  taskId?: string;
  taskNumber: number | string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  internshipStatus?: 'AVAILABLE' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'REJECTED';
  submittedOnTrack?: boolean;
  description: string;
  learningObjective?: string;
  prerequisites?: string;
  guide?: {
    overview?: string;
    learning_objectives?: string[];
    prerequisites?: string[];
    steps?: { step: number; title: string; description: string }[];
    recommended_resources?: { title: string; url: string }[];
    common_mistakes?: string[];
    submission_checklist?: string[];
  };
  tools?: string[];
  deliverables?: string[];
  evaluationCriteria?: { criterion: string; description: string; weight: number }[];
  allowedSubmissionTypes?: string[];
  keyFeatures?: string[];
  iconType?: 'linkedin' | 'number' | 'cert';
  bottomStatusText?: string;
  isCertificateTask?: boolean;
  submissionUrl?: string;
  submissionText?: string;
  submittedAt?: string;
  verificationReason?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  initials: string;
  internId: string;
  domain: string;
  joinedOn: string;
  status: 'Active' | 'Completed' | 'Inactive';
  totalInternships: number;
  completedInternships: number;
  email: string;
  phone: string;
  college: string;
  graduationYear: string;
  durationWeeks?: number;
  avatarUrl?: string;
}

export interface InternshipDomain {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  projectCount: number;
  category: string;
  skills: string[];
  popular?: boolean;
}

export interface PaymentItem {
  id: string;
  title: string;
  purpose: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed';
  dueDate: string;
  transactionId?: string;
  invoiceUrl?: string;
}

export interface CertificateData {
  id: string;
  certId: string;
  studentName: string;
  program: string;
  issueDate: string;
  status: 'Verified' | 'Pending Payment' | 'Processing';
  verificationUrl: string;
  pdfUrl?: string;
  endDate?: string;
  qrCodeUrl?: string;
}

export interface StudentCertificateAccess {
  eligible: boolean;
  reason?: 'payment_required' | 'tasks_incomplete' | 'enrollment_required' | 'certificate_revoked';
  payment_completed: boolean;
  payment_status: string;
  required_task_count: number;
  verified_task_count: number;
  tasks_complete: boolean;
  certificate?: {
    id: string;
    certificate_id: string;
    issue_date: string | null;
    status: string;
    end_date: string | null;
    student_name: string | null;
    domain_name: string | null;
    verification_url: string | null;
    file_path: string | null;
  };
}

export interface AdminCertificateAccess {
  student_id: string;
  student_name: string;
  email: string;
  domain_name: string;
  enrollment_id: string | null;
  enrollment_status: string | null;
  required_task_count: number;
  verified_task_count: number;
  tasks_complete: boolean;
  payment_completed: boolean;
  payment_status: string;
  payment_amount: number | null;
  payment_provider: string | null;
  payment_created_at: string | null;
  paid_at: string | null;
  provider_payment_id: string | null;
  provider_order_id: string | null;
  admin_override: boolean;
  override_granted_at: string | null;
  override_granted_by: string | null;
  override_note: string | null;
  certificate_status: string | null;
  access_unlocked: boolean;
}

/* ---------- Admin Dashboard Types ---------- */

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'In Review';

export interface InternshipApplication {
  id: string;
  studentName: string;
  studentInitials: string;
  email: string;
  domain: string;
  appliedOn: string;
  status: ApplicationStatus;
}

export interface PlatformStats {
  totalStudents: number;
  activeInterns: number;
  completedInterns: number;
  pendingApplications: number;
  totalApplications: number;
  totalRevenue: number;
  pendingRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  issuedCertificates: number;
}

export type OfferLetterStatus = 'Active' | 'Draft';

export interface OfferLetterTemplate {
  id: string;
  name: string;
  status: OfferLetterStatus;
  updatedAt: string;
  fileUrl?: string;
}

export interface AdminPayment {
  id: string;
  studentName: string;
  internId: string;
  purpose: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  date: string;
  transactionId?: string;
}

export interface AdminUser {
  name: string;
  initials: string;
  email: string;
  role: string;
  password?: string;
}
