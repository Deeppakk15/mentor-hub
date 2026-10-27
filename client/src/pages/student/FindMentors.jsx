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
  Search,
  UserCheck,
  Send,
  Building,
  GraduationCap,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';

export const FindMentors = () => {
  const [faculty, setFaculty] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Request modal state
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [studentMessage, setStudentMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (overrideSearch = searchTerm, overrideDept = selectedDept) => {
    try {
      setLoading(true);
      const querySearch = overrideSearch !== undefined ? overrideSearch : searchTerm;
      const queryDept = overrideDept !== undefined ? overrideDept : selectedDept;

      const [facRes, reqRes, projRes] = await Promise.all([
        api.get(`/users/faculty?search=${encodeURIComponent(querySearch.trim())}&department=${encodeURIComponent(queryDept)}`),
        api.get('/mentor-requests'),
        api.get('/projects'),
      ]);
      setFaculty(facRes.data.faculty || []);
      setSentRequests(reqRes.data.requests || []);
      setMyProjects(projRes.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch faculty directory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search on typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(searchTerm, selectedDept);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(searchTerm, selectedDept);
  };

  const handleOpenRequest = (fac) => {
    if (myProjects.length === 0) {
      toast.error('You must draft a project proposal before requesting mentorship.');
      return;
    }
    setSelectedFaculty(fac);
    setStudentMessage(`Hi ${fac.name}, our team is working on "${myProjects[0].title}". We would like to request you as our faculty project mentor.`);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedFaculty || myProjects.length === 0) return;

    setSubmitting(true);
    try {
      await api.post('/mentor-requests', {
        projectId: myProjects[0]._id,
        facultyId: selectedFaculty._id,
        studentMessage,
      });
      toast.success(`Mentorship request sent to ${selectedFaculty.name}!`);
      setShowRequestModal(false);
      fetchData(searchTerm, selectedDept);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send mentorship request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Mentors"
        description="Search faculty mentors by name, department, or expertise to request project guidance."
      />

      {/* Search & Filter Bar */}
      <Card>
        <div className="p-4 sm:p-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search by name, expertise, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
            </select>

            <Button type="submit" size="sm" className="w-full sm:w-auto shrink-0">
              Search
            </Button>
          </form>

          {/* Quick Filter Tag Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400 font-medium mr-1">Quick Search:</span>
            {['Dr. Harikesh Singh', 'Rashmi Singh', 'Harendra Singh', 'Aditya Adarsh', 'Promodanibala', 'Kajal Yadav'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setSearchTerm(searchTerm === name ? '' : name)}
                className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                  searchTerm === name
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {name}
              </button>
            ))}
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-[11px] text-rose-600 hover:underline ml-1 font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Sent Requests Tracking Strip */}
      {sentRequests.length > 0 && (
        <Card>
          <CardHeader
            title="Your Requests"
            subtitle="Status of sent mentorship requests"
          />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {sentRequests.map((req) => (
                <div key={req._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">
                        {req.requestedFaculty?.name}
                      </p>
                      <span className="text-[11px] text-slate-400">({req.requestedFaculty?.department})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Project: <strong className="text-slate-700">{req.project?.title}</strong>
                    </p>
                    {req.facultyFeedback && (
                      <p className="text-xs text-indigo-700 mt-1 italic bg-indigo-50 p-2 rounded-lg">
                        Faculty Feedback: "{req.facultyFeedback}"
                      </p>
                    )}
                  </div>
                  <Badge status={req.status} size="sm" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results summary bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{faculty.length}</strong> {faculty.length === 1 ? 'faculty member' : 'faculty members'}
          {searchTerm && <span> matching "<strong className="text-indigo-600">{searchTerm}</strong>"</span>}
          {selectedDept !== 'All' && <span> in <strong className="text-slate-700">{selectedDept}</strong></span>}
        </span>
        {(searchTerm || selectedDept !== 'All') && (
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setSelectedDept('All'); }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Faculty Directory Cards */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : faculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.map((fac) => {
            const hasPending = sentRequests.some(
              r => r.requestedFaculty?._id === fac._id && r.status === 'pending'
            );
            const isAssigned = myProjects.some(p => p.mentor?._id === fac._id || p.mentor === fac._id);

            return (
              <div
                key={fac._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold text-base flex items-center justify-center overflow-hidden shrink-0 border border-purple-200">
                      {fac.profileImage ? (
                        <img src={fac.profileImage} alt={fac.name} className="w-full h-full object-cover" />
                      ) : (
                        fac.name[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{fac.name}</h4>
                        {fac.name?.toLowerCase().includes('harikesh') && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Capstone Mentor
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{fac.department}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Active Projects: {fac.activeProjectsCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {fac.bio && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                      {fac.bio}
                    </p>
                  )}

                  {/* Expertise Tags */}
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Expertise
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {fac.expertise?.map((exp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  {isAssigned ? (
                    <Button size="sm" variant="outline" className="w-full text-emerald-700 border-emerald-300" disabled>
                      Assigned Mentor
                    </Button>
                  ) : hasPending ? (
                    <Button size="sm" variant="outline" className="w-full text-amber-700 border-amber-300" disabled>
                      Request Pending Review
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      icon={Send}
                      className="w-full"
                      onClick={() => handleOpenRequest(fac)}
                    >
                      Request Mentor
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="p-8">
            <EmptyState
              icon={Search}
              title="No Mentors Found"
              description="Try adjusting your search or clearing filters to view all faculty."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedDept('All');
              }}
            />
          </div>
        </Card>
      )}

      {/* Modal: Request Mentorship */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={`Request Mentor: ${selectedFaculty?.name}`}
        subtitle={`Department: ${selectedFaculty?.department}`}
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Proposal
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium">
              {myProjects[0]?.title || 'No active project'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message to Mentor
            </label>
            <textarea
              rows={4}
              required
              placeholder="Briefly introduce your team and project..."
              value={studentMessage}
              onChange={(e) => setStudentMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting} icon={Send}>
              Send Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
