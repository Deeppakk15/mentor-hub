import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { NotFound } from './pages/public/NotFound';
import { Unauthorized } from './pages/public/Unauthorized';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyTeam } from './pages/student/MyTeam';
import { StudentProjects } from './pages/student/StudentProjects';
import { FindMentors } from './pages/student/FindMentors';
import { TasksPage } from './pages/student/TasksPage';
import { MilestonesPage } from './pages/student/MilestonesPage';
import { DocumentsPage } from './pages/student/DocumentsPage';
import { MeetingsPage } from './pages/student/MeetingsPage';
import { StudentAIAssistant } from './pages/student/StudentAIAssistant';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { StudentProfile, StudentSettings } from './pages/student/StudentProfile';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { MentorRequests } from './pages/faculty/MentorRequests';
import { FacultyProjects } from './pages/faculty/FacultyProjects';
import { FacultyDocuments } from './pages/faculty/FacultyDocuments';
import { FacultyMeetings } from './pages/faculty/FacultyMeetings';
import { FacultyEvaluations } from './pages/faculty/FacultyEvaluations';
import { FacultyAIAssistant } from './pages/faculty/FacultyAIAssistant';
import { FacultyProfile, FacultySettings } from './pages/faculty/FacultyProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { DepartmentsPage } from './pages/admin/DepartmentsPage';
import { AcademicSessionsPage } from './pages/admin/AcademicSessionsPage';
import { ProjectDomainsPage } from './pages/admin/ProjectDomainsPage';
import { AdminProjects } from './pages/admin/AdminProjects';
import { FacultyWorkloadPage } from './pages/admin/FacultyWorkloadPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<LandingPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public-only auth routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Student Portal Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<AppLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/team" element={<MyTeam />} />
            <Route path="/student/projects" element={<StudentProjects />} />
            <Route path="/student/projects/create" element={<StudentProjects />} />
            <Route path="/student/projects/:id" element={<StudentProjects />} />
            <Route path="/student/mentors" element={<FindMentors />} />
            <Route path="/student/tasks" element={<TasksPage />} />
            <Route path="/student/milestones" element={<MilestonesPage />} />
            <Route path="/student/documents" element={<DocumentsPage />} />
            <Route path="/student/meetings" element={<MeetingsPage />} />
            <Route path="/student/ai-assistant" element={<StudentAIAssistant />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/settings" element={<StudentSettings />} />
          </Route>
        </Route>

        {/* Faculty Portal Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
          <Route element={<AppLayout />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/requests" element={<MentorRequests />} />
            <Route path="/faculty/projects" element={<FacultyProjects />} />
            <Route path="/faculty/projects/:id" element={<FacultyProjects />} />
            <Route path="/faculty/documents" element={<FacultyDocuments />} />
            <Route path="/faculty/meetings" element={<FacultyMeetings />} />
            <Route path="/faculty/evaluations" element={<FacultyEvaluations />} />
            <Route path="/faculty/ai-assistant" element={<FacultyAIAssistant />} />
            <Route path="/faculty/notifications" element={<NotificationsPage />} />
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/faculty/settings" element={<FacultySettings />} />
          </Route>
        </Route>

        {/* Admin Portal Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/departments" element={<DepartmentsPage />} />
            <Route path="/admin/sessions" element={<AcademicSessionsPage />} />
            <Route path="/admin/domains" element={<ProjectDomainsPage />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/workload" element={<FacultyWorkloadPage />} />
            <Route path="/admin/analytics" element={<AdminProjects />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
