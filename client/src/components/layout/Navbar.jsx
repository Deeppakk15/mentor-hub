import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Bell,
  Menu,
  GraduationCap,
  Sparkles,
  LogOut,
  User,
  ChevronDown,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, switchDemoAccount } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        // Silently ignore if unauthenticated
      }
    };
    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // 30s poll
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleRoleSwitch = async (targetRole) => {
    setShowDemoMenu(false);
    try {
      const newUser = await switchDemoAccount(targetRole);
      if (targetRole === 'student') navigate('/student/dashboard');
      else if (targetRole === 'faculty') navigate('/faculty/dashboard');
      else if (targetRole === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      // Error handled in auth context
    }
  };

  const roleColors = {
    student: 'bg-blue-50 text-blue-700 border-blue-200',
    faculty: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger & Institutional Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-tl-xl rounded-tr-md rounded-br-xl rounded-bl-md bg-teal-600 flex items-center justify-center text-white shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
            </div>
            <span className="text-base font-bold text-[#0B1A2D] tracking-tight">
              MentorHub
            </span>
          </Link>
        </div>

        {/* Right: Quick Demo Role Switcher, Notification Bell, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher Button for Instant Pair Review */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDemoMenu(!showDemoMenu);
                setShowProfileMenu(false);
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/70 transition-all cursor-pointer"
              title="Quick switch role for demo evaluation"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Demo Switch</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Demo Persona
                </div>
                <button
                  onClick={() => handleRoleSwitch('student')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">Alex Rivera</p>
                    <p className="text-[10px] text-slate-400">Student (Team Lead)</p>
                  </div>
                  {user?.role === 'student' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>
                <button
                  onClick={() => handleRoleSwitch('faculty')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">Dr. Marcus Vance</p>
                    <p className="text-[10px] text-slate-400">Faculty Mentor</p>
                  </div>
                  {user?.role === 'faculty' && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">Dr. Eleanor Vance</p>
                    <p className="text-[10px] text-slate-400">Dean / System Admin</p>
                  </div>
                  {user?.role === 'admin' && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          {/* In-app Notification Bell */}
          <Link
            to={user?.role === 'faculty' ? '/faculty/notifications' : '/student/notifications'}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User profile & Role pill */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowDemoMenu(false);
              }}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                  {user?.name?.split(' ')?.[0] || 'User'}
                </span>
                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 border ${roleColors[user?.role] || roleColors.student}`}>
                  {user?.role || 'Guest'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{user?.department}</p>
                </div>

                <Link
                  to={`/${user?.role}/profile`}
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile Overview</span>
                </Link>

                <Link
                  to={`/${user?.role}/settings`}
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </Link>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
