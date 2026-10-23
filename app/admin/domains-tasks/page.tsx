'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Layers, ListTodo, Pencil, Plus, Power, Trash2, X } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getAdminDomains, getTasksForDomain, invalidateDomainCache, upsertAdminDomain, upsertAdminTask } from '@/lib/supabase/queries';
import { DomainRow, TaskRow } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';

const emptyGuide = {
  overview: '',
  learning_objectives: [''],
  prerequisites: [''],
  steps: [{ step: 1, title: '', description: '' }],
  recommended_resources: [{ title: 'GitHub Docs', url: 'https://docs.github.com/' }],
  common_mistakes: [''],
  submission_checklist: [''],
};

const evaluation = [
  { criterion: 'Functionality', description: 'Required functionality works correctly.', weight: 30 },
  { criterion: 'Technical Implementation', description: 'Implementation follows appropriate technical practices.', weight: 25 },
  { criterion: 'Quality', description: 'Code/design is clean and organized.', weight: 20 },
  { criterion: 'Documentation', description: 'Project is properly documented.', weight: 15 },
  { criterion: 'Presentation', description: 'Final submission is clearly presented.', weight: 10 },
];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminDomainsTasksPage() {
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [activeDomain, setActiveDomain] = useState('');
  const [tab, setTab] = useState<'domains' | 'tasks'>('domains');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingDomain, setEditingDomain] = useState<Partial<DomainRow> & { skills?: string[] } | null>(null);
  const [editingTask, setEditingTask] = useState<Partial<TaskRow> | null>(null);

  const selectedDomain = useMemo(
    () => domains.find((domain) => domain.id === activeDomain),
    [domains, activeDomain]
  );

  const loadDomains = async () => {
    setLoading(true);
    try {
      const data = await getAdminDomains();
      setDomains(data);
      setActiveDomain((prev) => prev || data[0]?.id || '');
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load domains.');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (domainId: string) => {
    if (!domainId) return;
    try {
      setTasks(await getTasksForDomain(domainId));
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load tasks.');
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    loadTasks(activeDomain);
  }, [activeDomain]);

  const saveDomain = async () => {
    if (!editingDomain?.name?.trim()) {
      setError('Enter a domain name before saving.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await upsertAdminDomain({
        ...editingDomain,
        slug: editingDomain.slug || slugify(editingDomain.name),
        short_description: editingDomain.short_description || editingDomain.description || editingDomain.name,
        description: editingDomain.description || editingDomain.short_description || editingDomain.name,
        level: editingDomain.level || 'Beginner',
        duration_weeks: Number(editingDomain.duration_weeks || 4),
        duration_label: editingDomain.duration_label || `${editingDomain.duration_weeks || 4} Weeks`,
        is_active: editingDomain.is_active ?? true,
        display_order: Number(editingDomain.display_order || domains.length + 1),
      });
      setEditingDomain(null);
      await loadDomains();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save the domain.');
    } finally {
      setSaving(false);
    }
  };

  const saveTask = async () => {
    if (!editingTask?.title?.trim() || !activeDomain) {
      setError('Enter a task title and select a domain before saving.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await upsertAdminTask({
        ...editingTask,
        domain_id: activeDomain,
        slug: editingTask.slug || slugify(editingTask.title),
        task_number: Number(editingTask.task_number || tasks.length + 1),
        short_description: editingTask.short_description || editingTask.description || editingTask.title,
        description: editingTask.description || editingTask.short_description || editingTask.title,
        guide: editingTask.guide || emptyGuide,
        tools: editingTask.tools || [],
        deliverables: editingTask.deliverables || [],
        evaluation_criteria: editingTask.evaluation_criteria || evaluation,
        allowed_submission_types: editingTask.allowed_submission_types || ['github_url', 'live_url', 'text'],
        difficulty: editingTask.difficulty || 'Beginner',
        is_active: editingTask.is_active ?? true,
        is_required: editingTask.is_required ?? true,
        display_order: Number(editingTask.display_order || editingTask.task_number || tasks.length + 1),
      });
      setEditingTask(null);
      await loadTasks(activeDomain);
      await loadDomains();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save the task.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDomain = async (domain: DomainRow) => {
    setSaving(true);
    setError('');
    try {
      await upsertAdminDomain({ ...domain, is_active: !domain.is_active });
      await loadDomains();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Could not ${domain.is_active ? 'deactivate' : 'activate'} the domain.`);
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task: TaskRow) => {
    setSaving(true);
    setError('');
    try {
      await upsertAdminTask({ ...task, is_active: !task.is_active });
      await loadTasks(activeDomain);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update the task status.');
    } finally {
      setSaving(false);
    }
  };

  const duplicateTask = async (task: TaskRow) => {
    const copy: Partial<TaskRow> = { ...task };
    delete copy.id;
    setSaving(true);
    setError('');
    try {
      await upsertAdminTask({
        ...copy,
        title: `${task.title} Copy`,
        slug: `${task.slug}-copy-${Date.now()}`,
        task_number: tasks.length + 1,
        display_order: tasks.length + 1,
      });
      await loadTasks(activeDomain);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not duplicate the task.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (task: TaskRow) => {
    setSaving(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('tasks').delete().eq('id', task.id);
      if (deleteError) throw deleteError;
      const { data: domain } = await supabase.from('domains').select('slug').eq('id', task.domain_id).single();
      await invalidateDomainCache(domain?.slug);
      await loadTasks(activeDomain);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete the task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={Layers}
        badge="Catalog Management"
        title="Domains & Tasks"
        subtitle="Manage Supabase-backed internship domains, skills, and task roadmaps."
        action={
          <div className="flex gap-2">
            <button onClick={() => setTab('domains')} className={`px-4 py-2.5 rounded-2xl text-xs font-bold border ${tab === 'domains' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
              Domains ({domains.length})
            </button>
            <button onClick={() => setTab('tasks')} className={`px-4 py-2.5 rounded-2xl text-xs font-bold border ${tab === 'tasks' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
              Tasks ({tasks.length})
            </button>
          </div>
        }
      />

      {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">{error}</div>}
      {loading && <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500">Loading domain catalog...</div>}

      {tab === 'domains' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <div key={domain.id} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{domain.name}</h3>
                    <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${domain.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {domain.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button aria-label={`Edit domain ${domain.name}`} onClick={() => setEditingDomain({ ...domain, skills: domain.domain_skills?.map((s) => s.skill_name) || [] })} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-3 line-clamp-2">{domain.short_description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{domain.level} · {domain.duration_label || `${domain.duration_weeks} Weeks`}</span>
                  <span className="flex items-center gap-1"><ListTodo className="w-3.5 h-3.5 text-indigo-600" />{domain.tasks?.length || 0} Tasks</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {domain.domain_skills?.slice(0, 3).map((skill) => (
                    <span key={skill.id} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">{skill.skill_name}</span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => { setActiveDomain(domain.id); setTab('tasks'); }} className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">Manage Tasks</button>
                  <button onClick={() => toggleDomain(domain)} disabled={saving} className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                    <Power className="w-3.5 h-3.5" /> {domain.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setEditingDomain({ name: '', short_description: '', description: '', level: 'Beginner', duration_weeks: 4, skills: [] })} className="w-full bg-white p-5 rounded-3xl border border-dashed border-indigo-200 text-xs font-bold text-indigo-600 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add New Domain
          </button>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button key={domain.id} onClick={() => setActiveDomain(domain.id)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${activeDomain === domain.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                {domain.name}
              </button>
            ))}
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedDomain?.name} · Task Roadmap</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Create, edit, duplicate, order, and activate tasks.</p>
              </div>
              <button onClick={() => setEditingTask({ title: '', task_number: tasks.length + 1, guide: emptyGuide, evaluation_criteria: evaluation })} disabled={!activeDomain || saving} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
            <div role="region" aria-label="Task roadmap table; scroll horizontally to view all columns" tabIndex={0} className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    <th className="pb-3 pr-4">#</th><th className="pb-3 pr-4">Task Title</th><th className="pb-3 pr-4">Difficulty</th><th className="pb-3 pr-4">Status</th><th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className="py-3.5 pr-4"><span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-extrabold">{task.task_number}</span></td>
                      <td className="py-3.5 pr-4"><p className="text-sm font-bold text-slate-900">{task.title}</p><p className="text-[11px] text-slate-500 truncate max-w-[360px]">{task.short_description}</p></td>
                      <td className="py-3.5 pr-4 text-xs text-slate-500">{task.difficulty}</td>
                      <td className="py-3.5 pr-4"><span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${task.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{task.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button aria-label={`Edit ${task.title}`} onClick={() => setEditingTask(task)} disabled={saving} className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50"><Pencil className="w-3.5 h-3.5" /></button>
                          <button aria-label={`Duplicate ${task.title}`} onClick={() => duplicateTask(task)} disabled={saving} className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50"><Copy className="w-3.5 h-3.5" /></button>
                          <button aria-label={`${task.is_active ? 'Deactivate' : 'Activate'} ${task.title}`} onClick={() => toggleTask(task)} disabled={saving} className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50"><Power className="w-3.5 h-3.5" /></button>
                          <button aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task)} disabled={saving} className="p-2 rounded-xl border border-rose-200 text-rose-600 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-xs font-medium text-slate-400">No tasks defined for this domain yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {editingDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingDomain(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="domain-editor-title" className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between"><h3 id="domain-editor-title" className="text-lg font-bold text-slate-900">Domain Editor</h3><button aria-label="Close domain editor" onClick={() => setEditingDomain(null)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="p-6 space-y-4">
              <input aria-label="Domain name" value={editingDomain.name || ''} onChange={(e) => setEditingDomain({ ...editingDomain, name: e.target.value })} placeholder="Domain name" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
              <textarea aria-label="Short description" rows={2} value={editingDomain.short_description || ''} onChange={(e) => setEditingDomain({ ...editingDomain, short_description: e.target.value })} placeholder="Short description" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none resize-none" />
              <textarea aria-label="Full description" rows={4} value={editingDomain.description || ''} onChange={(e) => setEditingDomain({ ...editingDomain, description: e.target.value })} placeholder="Full description" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input aria-label="Difficulty level" value={editingDomain.level || 'Beginner'} onChange={(e) => setEditingDomain({ ...editingDomain, level: e.target.value as DomainRow['level'] })} placeholder="Level" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
                <input aria-label="Duration in weeks" type="number" value={editingDomain.duration_weeks || 4} onChange={(e) => setEditingDomain({ ...editingDomain, duration_weeks: Number(e.target.value) })} placeholder="Duration weeks" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
              </div>
              <input aria-label="Skills, comma separated" value={(editingDomain.skills || []).join(', ')} onChange={(e) => setEditingDomain({ ...editingDomain, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Skills, comma separated" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
              <button onClick={saveDomain} disabled={saving} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs disabled:opacity-50"><Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Domain'}</button>
            </div>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingTask(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="task-editor-title" className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between"><h3 id="task-editor-title" className="text-lg font-bold text-slate-900">Task Editor</h3><button aria-label="Close task editor" onClick={() => setEditingTask(null)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <input aria-label="Task number" type="number" value={editingTask.task_number || 1} onChange={(e) => setEditingTask({ ...editingTask, task_number: Number(e.target.value) })} placeholder="Task number" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
                <input aria-label="Difficulty" value={editingTask.difficulty || 'Beginner'} onChange={(e) => setEditingTask({ ...editingTask, difficulty: e.target.value })} placeholder="Difficulty" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
              </div>
              <input aria-label="Task title" value={editingTask.title || ''} onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} placeholder="Task title" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
              <textarea aria-label="Short description" rows={2} value={editingTask.short_description || ''} onChange={(e) => setEditingTask({ ...editingTask, short_description: e.target.value })} placeholder="Short description" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none resize-none" />
              <textarea aria-label="Description" rows={4} value={editingTask.description || ''} onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} placeholder="Description" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none resize-none" />
              <textarea aria-label="Learning objective" rows={2} value={editingTask.learning_objective || ''} onChange={(e) => setEditingTask({ ...editingTask, learning_objective: e.target.value })} placeholder="Learning objective" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none resize-none" />
              <input aria-label="Tools, comma separated" value={(editingTask.tools || []).join(', ')} onChange={(e) => setEditingTask({ ...editingTask, tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Tools, comma separated" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
              <input aria-label="Deliverables, comma separated" value={(editingTask.deliverables || []).join(', ')} onChange={(e) => setEditingTask({ ...editingTask, deliverables: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Deliverables, comma separated" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none" />
              <button onClick={saveTask} disabled={saving} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs disabled:opacity-50"><Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Task'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
