import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  CheckSquare,
  Plus,
  Kanban,
  List,
  Clock,
  User,
  Trash2,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/projects');
      if (projRes.data.projects?.length > 0) {
        const currentProj = projRes.data.projects[0];
        setProject(currentProj);

        const [tasksRes, teamRes] = await Promise.all([
          api.get(`/projects/${currentProj._id}/tasks`),
          api.get('/teams/me'),
        ]);

        setTasks(tasksRes.data.tasks || []);
        setTeamMembers(teamRes.data.team?.members || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !project) return;

    setSubmitting(true);
    try {
      await api.post(`/projects/${project._id}/tasks`, taskForm);
      toast.success('Task created successfully');
      setShowCreateModal(false);
      setTaskForm({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        dueDate: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task removed.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  const kanbanColumns = [
    { key: 'todo', label: 'To Do', color: 'border-slate-300' },
    { key: 'in_progress', label: 'In Progress', color: 'border-blue-400' },
    { key: 'in_review', label: 'In Review', color: 'border-purple-400' },
    { key: 'completed', label: 'Completed', color: 'border-emerald-400' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return <SkeletonLoader count={4} type="stat" />;
  }

  if (!project) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No Active Project Found"
        description="Create and submit a project proposal first before creating sprint tasks."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Tasks & Kanban Board"
        description={`Manage sprint backlogs, assignments, and deadlines for: ${project.title}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'kanban' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <Button icon={Plus} size="sm" onClick={() => setShowCreateModal(true)}>
              New Task
            </Button>
          </div>
        }
      />

      {/* Filter Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {viewMode === 'list' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.key);

            return (
              <div key={col.key} className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col">
                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/70 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-white text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center border border-slate-200">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {columnTasks.map((task) => (
                    <div
                      key={task._id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Badge status={task.priority} size="xs" />
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-slate-300 hover:text-rose-600 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[90px]">{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                        {task.dueDate && (
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Quick Move Status Selector */}
                      <div className="pt-1 flex gap-1">
                        {kanbanColumns
                          .filter((c) => c.key !== task.status)
                          .map((c) => (
                            <button
                              key={c.key}
                              onClick={() => handleStatusChange(task._id, c.key)}
                              className="flex-1 py-1 px-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 rounded text-[9px] font-semibold border border-slate-200 transition-colors"
                            >
                              → {c.label.split(' ')[0]}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      No tasks in this lane
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Task Title</th>
                  <th className="p-3.5">Assignee</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{task.title}</td>
                    <td className="p-3.5 text-slate-600">{task.assignee?.name || 'Unassigned'}</td>
                    <td className="p-3.5">
                      <Badge status={task.priority} size="xs" />
                    </td>
                    <td className="p-3.5">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-semibold"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Create Task */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Sprint Task"
        subtitle="Define deliverable details and assign to a team member"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Zero-Knowledge proof generation in Circom"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide technical requirements, API endpoints, or acceptance criteria..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee
              </label>
              <select
                value={taskForm.assignee}
                onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.user?._id || m._id} value={m.user?._id || m.user}>
                    {m.user?.name || 'Team Member'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
