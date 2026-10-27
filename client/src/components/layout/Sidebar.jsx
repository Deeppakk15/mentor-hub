import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  UserCheck,
  CheckSquare,
  Milestone,
  FileText,
  Calendar,
  Sparkles,
  Bell,
  User,
  Settings,
  Award,
  Building2,
  CalendarDays,
  Tag,
  BarChart3,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentNav = [
    { label: 'Overview', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Team', to: '/student/team', icon: Users },
    { label: 'My Projects', to: '/student/projects', icon: FolderGit2 },
    { label: 'Find Mentors', to: '/student/mentors', icon: UserCheck },
    { label: 'Tasks & Board', to: '/student/tasks', icon: CheckSquare },
    { label: 'Milestones', to: '/student/milestones', icon: Milestone },
    { label: 'Documents', to: '/student/documents', icon: FileText },
    { label: 'Meetings', to: '/student/meetings', icon: Calendar },
    { label: 'AI Assistant', to: '/student/ai-assistant', icon: Sparkles, badge: 'AI' },
    { label: 'Notifications', to: '/student/notifications', icon: Bell },
    { label: 'Profile', to: '/student/profile', icon: User },
    { label: 'Settings', to: '/student/settings', icon: Settings },
  ];

  const facultyNav = [
    { label: 'Overview', to: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Mentor Requests', to: '/faculty/requests', icon: UserCheck },
    { label: 'My Projects', to: '/faculty/projects', icon: FolderGit2 },
    { label: 'Documents Review', to: '/faculty/documents', icon: FileText },
    { label: 'Meetings', to: '/faculty/meetings', icon: Calendar },
    { label: 'Evaluations', to: '/faculty/evaluations', icon: Award },
    { label: 'AI Assistant', to: '/faculty/ai-assistant', icon: Sparkles, badge: 'AI' },
    { label: 'Notifications', to: '/faculty/notifications', icon: Bell },
    { label: 'Profile', to: '/faculty/profile', icon: User },
    { label: 'Settings', to: '/faculty/settings', icon: Settings },
  ];

  const adminNav = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', to: '/admin/users', icon: Users },
    { label: 'Departments', to: '/admin/departments', icon: Building2 },
    { label: 'Academic Sessions', to: '/admin/sessions', icon: CalendarDays },
    { label: 'Project Domains', to: '/admin/domains', icon: Tag },
    { label: 'Institutional Projects', to: '/admin/projects', icon: FolderGit2 },
    { label: 'Faculty Workload', to: '/admin/workload', icon: UserCheck },
    { label: 'Reports & CSV', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'System Settings', to: '/admin/settings', icon: Settings },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'faculty' ? facultyNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 h-full lg:h-[calc(100vh-57px)] w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {role} Portal
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Academic Session & Institution footer pill */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-slate-800 truncate">2025-2026 Session</p>
                <p className="text-[10px] text-emerald-600 font-medium">● Proposal Submissions Open</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
