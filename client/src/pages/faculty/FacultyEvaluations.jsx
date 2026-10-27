import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { toast } from 'sonner';
import { Award, CheckCircle2, Save, Send, Sparkles, BookOpen } from 'lucide-react';

export const FacultyEvaluations = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const defaultRubrics = [
    { name: 'Problem Understanding & Research Scope', maxScore: 15, score: 14, comment: '' },
    { name: 'Technical Architecture & Implementation', maxScore: 20, score: 18, comment: '' },
    { name: 'Innovation & Research Originality', maxScore: 15, score: 13, comment: '' },
    { name: 'Code Quality, Testing & CI/CD Standards', maxScore: 15, score: 14, comment: '' },
    { name: 'Documentation & Technical IEEE Reporting', maxScore: 15, score: 14, comment: '' },
    { name: 'Viva Voce Examination & Defense', maxScore: 10, score: 9, comment: '' },
    { name: 'Team Collaboration & Agile Backlog Execution', maxScore: 10, score: 9, comment: '' },
  ];

  const fetchProjectsAndEvals = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/projects');
      const projs = projRes.data.projects || [];
      setProjects(projs);

      if (projs.length > 0) {
        const curId = selectedProjectId || projs[0]._id;
        setSelectedProjectId(curId);

        const evalRes = await api.get(`/projects/${curId}/evaluations`);
        const evals = evalRes.data.evaluations || [];
        setEvaluations(evals);

        if (evals.length > 0) {
          setCriteria(evals[0].criteria || defaultRubrics);
          setFeedback(evals[0].feedback || '');
        } else {
          setCriteria(defaultRubrics);
          setFeedback('Commendable execution across full-stack architecture and zero-knowledge circuit validation.');
        }
      }
    } catch (err) {
      console.error('Failed to load evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndEvals();
  }, [selectedProjectId]);

  const handleScoreChange = (index, val) => {
    const num = Math.min(criteria[index].maxScore, Math.max(0, Number(val) || 0));
    const updated = [...criteria];
    updated[index].score = num;
    setCriteria(updated);
  };

  const handleCommentChange = (index, comment) => {
    const updated = [...criteria];
    updated[index].comment = comment;
    setCriteria(updated);
  };

  const totalScore = criteria.reduce((sum, item) => sum + (Number(item.score) || 0), 0);

  const handleSubmitEvaluation = async (status) => {
    if (!selectedProjectId) return;

    if (status === 'submitted') {
      if (!window.confirm(`Publish final evaluation score of ${totalScore}/100? This marks the capstone as completed.`)) return;
    }

    setSubmitting(true);
    try {
      await api.post(`/projects/${selectedProjectId}/evaluations`, {
        criteria,
        feedback,
        status,
      });
      toast.success(status === 'submitted' ? 'Evaluation finalized and published!' : 'Draft evaluation saved.');
      fetchProjectsAndEvals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  const activeProj = projects.find(p => p._id === selectedProjectId);

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Faculty Project Evaluation & Viva Voce Grading"
        description="Standardized multi-criteria rubric evaluation across problem understanding, implementation, innovation, and code quality."
        actions={
          projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          )
        }
      />

      {activeProj ? (
        <div className="space-y-6">
          {/* Summary Metric Header */}
          <Card>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge status={activeProj.status} size="sm" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Team: {activeProj.team?.name}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{activeProj.title}</h2>
              </div>

              {/* Score Display Pill */}
              <div className="px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-center shrink-0">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Computed Score
                </span>
                <span className="text-3xl font-extrabold text-indigo-700 font-mono tracking-tight">
                  {totalScore}
                  <span className="text-sm font-semibold text-indigo-400">/100</span>
                </span>
              </div>
            </div>
          </Card>

          {/* Rubrics Form */}
          <Card>
            <CardHeader
              title="Academic Evaluation Rubric (7 Assessment Criteria)"
              subtitle="Enter scores for each criterion (total computed in real-time)"
            />
            <CardBody className="p-6 space-y-5">
              <div className="space-y-4">
                {criteria.map((crit, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{crit.name}</span>
                        <span className="text-[11px] text-slate-400 ml-2 font-mono">(Max: {crit.maxScore} pts)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Points Awarded:</span>
                        <input
                          type="number"
                          min="0"
                          max={crit.maxScore}
                          value={crit.score}
                          onChange={(e) => handleScoreChange(idx, e.target.value)}
                          className="w-16 px-2.5 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Optional criterion-level feedback note..."
                      value={crit.comment || ''}
                      onChange={(e) => handleCommentChange(idx, e.target.value)}
                      className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white placeholder:text-slate-400"
                    />
                  </div>
                ))}
              </div>

              {/* Comprehensive Written Feedback */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Overall Committee Feedback & Viva Voce Remarks
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Summarize the candidate's defense performance, code architecture, and recommendations for publication..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Total Final Grade: <strong className="text-indigo-600 font-mono text-sm">{totalScore} / 100</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Save}
                    onClick={() => handleSubmitEvaluation('draft')}
                    isLoading={submitting}
                  >
                    Save Draft
                  </Button>
                  <Button
                    size="sm"
                    icon={Award}
                    onClick={() => handleSubmitEvaluation('submitted')}
                    isLoading={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Publish Final Evaluation
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="p-10">
            <EmptyState
              icon={Award}
              title="No Projects Available for Evaluation"
              description="When student teams reach the final phase of their capstone, they can be evaluated and graded here."
            />
          </div>
        </Card>
      )}
    </div>
  );
};
