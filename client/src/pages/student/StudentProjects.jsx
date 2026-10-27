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
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FolderGit2,
  FileText,
  Send,
  Edit3,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Cpu,
  Layers,
  Search,
} from 'lucide-react';

export const StudentProjects = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Proposal Form modal/editing state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAIReviewModal, setShowAIReviewModal] = useState(false);
  const [aiReviewContent, setAiReviewContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    problemStatement: '',
    objectives: '',
    domain: 'Web Engineering & SaaS',
    technologies: '',
    expectedOutcomes: '',
    references: '',
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);

      if (id) {
        const detailRes = await api.get(`/projects/${id}`);
        setActiveProject(detailRes.data.project);
      } else if (res.data.projects?.length > 0) {
        setActiveProject(res.data.projects[0]);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [id]);

  const handleOpenEdit = (proj) => {
    if (proj) {
      setFormData({
        title: proj.title || '',
        abstract: proj.abstract || '',
        problemStatement: proj.problemStatement || '',
        objectives: proj.objectives || '',
        domain: proj.domain || 'Web Engineering & SaaS',
        technologies: proj.technologies?.join(', ') || '',
        expectedOutcomes: proj.expectedOutcomes || '',
        references: proj.references || '',
      });
    } else {
      setFormData({
        title: '',
        abstract: '',
        problemStatement: '',
        objectives: '',
        domain: 'Web Engineering & SaaS',
        technologies: 'React, Node.js, MongoDB, Tailwind CSS',
        expectedOutcomes: '',
        references: '',
      });
    }
    setShowEditModal(true);
  };

  const handleSaveProposal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.abstract.trim()) {
      toast.error('Title and Abstract are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (activeProject && activeProject._id) {
        // Update existing draft
        const res = await api.patch(`/projects/${activeProject._id}`, formData);
        setActiveProject(res.data.project);
        toast.success('Project proposal updated.');
      } else {
        // Create new proposal
        const res = await api.post('/projects', formData);
        setActiveProject(res.data.project);
        toast.success('Project proposal created as Draft.');
      }
      setShowEditModal(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!activeProject) return;
    if (!window.confirm('Submit this proposal for faculty committee review? Once submitted, the draft is locked until reviewed.')) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/projects/${activeProject._id}/submit`);
      setActiveProject(res.data.project);
      toast.success('Proposal submitted for faculty review!');
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIProposalReview = async () => {
    setShowAIReviewModal(true);
    setAiLoading(true);
    try {
      const res = await api.post('/ai/review-proposal', {
        title: activeProject?.title || formData.title,
        abstract: activeProject?.abstract || formData.abstract,
        problemStatement: activeProject?.problemStatement || formData.problemStatement,
        objectives: activeProject?.objectives || formData.objectives,
        domain: activeProject?.domain || formData.domain,
        technologies: activeProject?.technologies || formData.technologies.split(','),
      });
      setAiReviewContent(res.data.text);
    } catch (err) {
      toast.error('AI proposal evaluation unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  const canEdit = activeProject && ['draft', 'changes_requested'].includes(activeProject.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Proposal"
        description="Draft, edit, and submit your project proposal for mentor review."
        actions={
          activeProject ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Sparkles}
                onClick={handleAIProposalReview}
              >
                AI Review
              </Button>
              {canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() => handleOpenEdit(activeProject)}
                  >
                    Edit Proposal
                  </Button>
                  <Button
                    size="sm"
                    icon={Send}
                    onClick={handleSubmitForReview}
                    isLoading={submitting}
                  >
                    Submit Proposal
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Button icon={FolderGit2} size="sm" onClick={() => handleOpenEdit(null)}>
              New Proposal
            </Button>
          )
        }
      />

      {/* Main Proposal Card or Empty State */}
      {activeProject ? (
        <div className="space-y-6">
          {/* Header Card with Status Banner */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge status={activeProject.status} size="sm" />
                    <span className="text-xs font-mono text-slate-400">Submission v{activeProject.submissionVersion}.0</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {activeProject.domain}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{activeProject.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  {!activeProject.mentor && (
                    <Link to="/student/mentors">
                      <Button size="sm" icon={Search} variant="secondary">
                        Find Mentor
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Proposal Content Grid */}
              <div className="mt-6 space-y-6 text-xs text-slate-700">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Abstract
                  </h3>
                  <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
                    {activeProject.abstract}
                  </p>
                </div>

                {activeProject.problemStatement && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Problem Statement
                    </h3>
                    <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans whitespace-pre-line">
                      {activeProject.problemStatement}
                    </p>
                  </div>
                )}

                {activeProject.objectives && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Objectives
                    </h3>
                    <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans whitespace-pre-line">
                      {activeProject.objectives}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProject.technologies?.map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-mono font-medium border border-indigo-100">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Mentor
                    </h3>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                        {activeProject.mentor?.name?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{activeProject.mentor?.name || 'No mentor assigned yet'}</p>
                        <p className="text-[11px] text-slate-500">{activeProject.mentor?.department || 'Request a mentor'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {activeProject.references && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      References
                    </h3>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[11px] whitespace-pre-line">
                      {activeProject.references}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Proposal Review History Timeline */}
          {activeProject.approvalHistory && activeProject.approvalHistory.length > 0 && (
            <Card>
              <CardHeader
                title="Review History"
                subtitle="Mentor feedback and status updates"
              />
              <CardBody className="p-6">
                <div className="space-y-4">
                  {activeProject.approvalHistory.map((hist, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 pb-4 border-b border-slate-100 last:border-none last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge status={hist.status} size="xs" />
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(hist.updatedAt).toLocaleDateString()} at {new Date(hist.updatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        {hist.feedback && (
                          <p className="text-xs text-slate-700 mt-1.5 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                            "{hist.feedback}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <div className="p-10">
            <EmptyState
              icon={FolderGit2}
              title="No Project Proposal"
              description="Start your project by drafting your proposal, domain, and technologies."
              actionLabel="Create Proposal"
              onAction={() => handleOpenEdit(null)}
            />
          </div>
        </Card>
      )}

      {/* Modal: Create or Edit Proposal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={activeProject ? 'Edit Proposal' : 'New Project Proposal'}
        subtitle="Enter your project details below"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveProposal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Student Project & Mentorship Management System"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Domain
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Cybersecurity & Blockchain">Cybersecurity & Blockchain</option>
                <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                <option value="Web Engineering & SaaS">Web Engineering & SaaS</option>
                <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                <option value="Data Science & Big Data">Data Science & Big Data</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, Express, MongoDB"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Abstract
            </label>
            <textarea
              rows={3}
              required
              placeholder="Short summary of your project..."
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Problem Statement
            </label>
            <textarea
              rows={2}
              placeholder="What problem does your project solve?"
              value={formData.problemStatement}
              onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Objectives
            </label>
            <textarea
              rows={2}
              placeholder="Key goals and deliverables..."
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              References (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Relevant links, papers, or documentation..."
              value={formData.references}
              onChange={(e) => setFormData({ ...formData, references: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Save Proposal Draft
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: AI Proposal Audit */}
      <Modal
        isOpen={showAIReviewModal}
        onClose={() => setShowAIReviewModal(false)}
        title="AI Proposal Review"
        subtitle="Feedback on your project proposal"
        maxWidth="max-w-2xl"
      >
        {aiLoading ? (
          <div className="py-10 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Reviewing proposal text and structure...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-sans max-h-96 overflow-y-auto whitespace-pre-wrap">
              {aiReviewContent}
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowAIReviewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
