'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { Modal } from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Calendar, CheckCircle2, AlertTriangle, Link as LinkIcon, Upload, ArrowRight, Loader2 } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskSubmit?: (taskId: string, submissionUrl: string) => Promise<void> | void;
}

function submissionErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Could not submit this task. Please try again.';
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskSubmit,
}) => {
  const [submissionUrl, setSubmissionUrl] = useState(task.submissionUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const isLocked = false;
  const isUnderReview = task.internshipStatus === 'VERIFICATION_PENDING' || task.internshipStatus === 'SUBMITTED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (onTaskSubmit) {
        await onTaskSubmit(task.id, submissionUrl);
      }
      setSuccessToast(true);
    } catch (error) {
      setSubmitError(submissionErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} maxWidth="max-w-2xl">
      <div className="space-y-6">
        
        {/* Status Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <StatusBadge status={task.status} />
          </div>
          {!isUnderReview && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Due Date: <strong className="text-slate-900">{task.dueDate}</strong></span>
            </div>
          )}
        </div>

        {/* Task Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {task.description}
          </p>
        </div>

        {/* Key Features / Requirements */}
        {task.keyFeatures && task.keyFeatures.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Requirements</h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              {task.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {task.learningObjective && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Learning Objective</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              {task.learningObjective}
            </p>
          </div>
        )}

        {task.guide?.steps && task.guide.steps.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Guide</h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
              {task.guide.steps.map((step) => (
                <div key={step.step} className="flex gap-3 text-xs text-slate-700">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold shrink-0">
                    {step.step}
                  </span>
                  <div>
                    <p className="font-extrabold text-slate-900">{step.title}</p>
                    <p className="mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {task.tools && task.tools.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tools</h4>
            <div className="flex flex-wrap gap-2">
              {task.tools.map((tool) => (
                <span key={tool} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {task.evaluationCriteria && task.evaluationCriteria.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evaluation Criteria</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.evaluationCriteria.map((criterion) => (
                <div key={criterion.criterion} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-extrabold text-slate-900">{criterion.criterion} · {criterion.weight}%</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{criterion.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLocked ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0" />
              <span>Task Locked</span>
            </div>
            <p className="text-xs leading-relaxed">
              This task will unlock as soon as the previous submission is sent for review. You can continue working while it is under review.
            </p>
          </div>
        ) : isUnderReview ? (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span>Verification Pending</span>
            </div>
            <p className="text-xs text-blue-700 font-medium">
              Your submission is queued for automatic verification in about 2 minutes. Please allow up to 10 minutes for the status to update.
            </p>
          </div>
        ) : task.status === 'Completed' ? (
          /* Completed Submission View */
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Task Submission Completed</span>
            </div>
            {task.submissionUrl && (
              <p className="text-xs text-emerald-700 font-medium break-all">
                Submitted URL: <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="underline">{task.submissionUrl}</a>
              </p>
            )}
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            {submitError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{submitError}</p>}
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submit Project Deliverable</h4>
            
            {/* Input URL */}
            <div>
              <label htmlFor="task-submission-url" className="block text-xs font-semibold text-slate-700 mb-1">
                Project / Repository URL
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="task-submission-url"
                  type="url"
                  required
                  placeholder="https://github.com/your-username/project-repo"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-900 font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Drag & Drop Mock Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Screenshots / Documentation (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 bg-slate-50/50 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Drag & drop your files here, or <span className="text-indigo-600">browse</span></p>
                <p className="text-[11px] text-slate-400 mt-1">ZIP, PDF, PNG up to 25MB</p>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Work...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Work</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Success Feedback Toast */}
        {successToast && (
          <div role="status" className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center animate-in fade-in duration-200">
            Submission received. This task will update automatically after verification.
          </div>
        )}

      </div>
    </Modal>
  );
};
