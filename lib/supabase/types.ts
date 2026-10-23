import { Task, TaskStatus } from '@/lib/types';

export type InternshipTaskStatus =
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export interface DomainRow {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_weeks: number;
  duration_label: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  display_order: number;
  domain_skills?: DomainSkillRow[];
  tasks?: Pick<TaskRow, 'id' | 'title' | 'task_number' | 'short_description' | 'difficulty' | 'estimated_hours'>[];
}

export interface DomainSkillRow {
  id: string;
  domain_id: string;
  skill_name: string;
  display_order: number;
}

export interface GuideStep {
  step: number;
  title: string;
  description: string;
}

export interface GuideResource {
  title: string;
  url: string;
}

export interface TaskGuide {
  overview?: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  steps?: GuideStep[];
  recommended_resources?: GuideResource[];
  common_mistakes?: string[];
  submission_checklist?: string[];
}

export interface EvaluationCriterion {
  criterion: string;
  description: string;
  weight: number;
}

export interface TaskRow {
  id: string;
  domain_id: string;
  title: string;
  slug: string;
  task_number: number;
  short_description: string;
  description: string;
  learning_objective: string | null;
  prerequisites: string | null;
  guide: TaskGuide;
  tools: string[];
  deliverables: string[];
  evaluation_criteria: EvaluationCriterion[];
  allowed_submission_types: string[];
  difficulty: string;
  estimated_hours: number | null;
  due_days: number | null;
  is_active: boolean;
  is_required: boolean;
  display_order: number;
}

export interface StudentTaskRow {
  id: string;
  enrollment_id: string;
  task_id: string;
  student_id: string;
  status: InternshipTaskStatus;
  submission_url: string | null;
  submission_text: string | null;
  submission_file_path: string | null;
  submitted_at: string | null;
  verification_due_at: string | null;
  verified_at: string | null;
  verification_reason: string | null;
  attempt_number: number;
  tasks: TaskRow;
}

export function mapStudentTask(row: StudentTaskRow): Task {
  const task = row.tasks;
  const statusMap: Record<InternshipTaskStatus, TaskStatus> = {
    AVAILABLE: 'Available',
    IN_PROGRESS: 'Pending',
    SUBMITTED: 'Pending',
    VERIFICATION_PENDING: 'Pending',
    VERIFIED: 'Completed',
    REJECTED: 'Pending',
  };

  return {
    id: row.id,
    taskId: task.id,
    taskNumber: task.task_number,
    title: task.title,
    dueDate: row.status === 'VERIFICATION_PENDING' || row.status === 'SUBMITTED'
      ? 'Verification pending'
      : task.due_days
        ? `${task.due_days} days`
        : 'Available',
    status: statusMap[row.status],
    internshipStatus: row.status,
    submittedOnTrack: row.status === 'VERIFIED',
    description: task.description,
    learningObjective: task.learning_objective || undefined,
    prerequisites: task.prerequisites || undefined,
    guide: task.guide,
    tools: task.tools || [],
    deliverables: task.deliverables || [],
    evaluationCriteria: task.evaluation_criteria || [],
    allowedSubmissionTypes: task.allowed_submission_types || [],
    keyFeatures: task.deliverables || [],
    iconType: 'number',
    bottomStatusText:
      row.status === 'VERIFICATION_PENDING' || row.status === 'SUBMITTED'
        ? 'Automatic verification usually completes in about 2 minutes. Allow up to 10 minutes for the status to update.'
        : undefined,
    submissionUrl: row.submission_url || undefined,
    submittedAt: row.submitted_at || undefined,
    verificationReason: row.verification_reason || undefined,
  };
}
