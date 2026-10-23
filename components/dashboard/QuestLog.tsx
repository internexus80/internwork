'use client';

import React, { useState } from 'react';
import { ListTodo, CheckCircle2 } from 'lucide-react';
import { Task } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';

interface QuestLogProps {
  tasks: Task[];
  onTaskSubmit?: (taskId: string, submissionUrl: string) => void;
}

export const QuestLog: React.FC<QuestLogProps> = ({ tasks, onTaskSubmit }) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.status === 'Completed';
    if (filter === 'pending') return task.status !== 'Completed';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Quest Log Header & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        
        {/* Title & Subtitle */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Quest Log
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Track and complete all tasks to finish your internship.
            </p>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 self-start md:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              filter === 'completed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Completed ({tasks.filter(t => t.status === 'Completed').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Pending ({tasks.filter(t => t.status !== 'Completed').length})
          </button>
        </div>
      </div>

      {/* Task Grid (Desktop: 4 columns, Tablet: 2 columns, Mobile: 1 column) */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpenDetails={(taskToOpen) => setSelectedTaskId(taskToOpen.id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No tasks found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no tasks matching the selected filter criteria right now.
          </p>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onTaskSubmit={onTaskSubmit}
        />
      )}
    </div>
  );
};
