import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  Sparkles,
  Award,
  FileCheck2,
  HelpCircle,
  Copy,
  Check,
  Send,
  BookOpen,
} from 'lucide-react';

export const FacultyAIAssistant = () => {
  const [activeTab, setActiveTab] = useState('viva'); // 'viva' | 'summary' | 'feedback' | 'completeness'

  // Form states
  const [projectTitle, setProjectTitle] = useState('Zero-Knowledge Credential Verification Protocol for Academic Records');
  const [domain, setDomain] = useState('Cybersecurity & Blockchain');
  const [technologies, setTechnologies] = useState('Solidity, Circom, Ethereum, Node.js, React, IPFS');
  const [abstract, setAbstract] = useState('A privacy-preserving academic credential verification system utilizing zero-knowledge SNARKs and IPFS decentralized storage. The system enables universities to issue verifiable cryptographic diploma proofs that employers can validate instantly without exposing student grades, personal IDs, or private academic histories.');

  // Result state
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResultText('');
    try {
      let res;
      if (activeTab === 'viva') {
        res = await api.post('/ai/generate-viva-questions', {
          projectTitle,
          domain,
          technologies: technologies.split(',').map(s => s.trim()),
          abstract,
        });
      } else if (activeTab === 'summary') {
        res = await api.post('/ai/summarize-report', {
          title: projectTitle,
          reportText: abstract,
        });
      } else if (activeTab === 'feedback') {
        res = await api.post('/ai/draft-feedback', {
          projectTitle,
          studentTeam: 'CyberShield Protocol Squad',
          milestoneTitle: 'Milestone 2: Hardhat Prototype & Testnet Deployment',
          performanceNotes: 'Demonstrated solid working smart contracts. Requisite improvements in UI error boundaries.',
          approvalDecision: 'Approved',
        });
      } else if (activeTab === 'completeness') {
        res = await api.post('/ai/review-proposal', {
          title: projectTitle,
          abstract,
          problemStatement: 'Current credential verification is slow and vulnerable to credential forgery.',
          objectives: '1. Develop ZK circuit. 2. Deploy smart contracts. 3. Build employer verification portal.',
          domain,
          technologies: technologies.split(',').map(s => s.trim()),
        });
      }

      setResultText(res?.data?.text || '');
      toast.success('AI recommendations generated successfully.');
    } catch (err) {
      toast.error('AI generation request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Faculty AI Academic Advisory Suite"
        description="Leverage Google Gemini AI models to assist with viva voce question formulation, report summarization, and milestone feedback drafting."
      />

      {/* Advisory Banner */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
        <span>
          <strong>Faculty Discretion Notice:</strong> AI tools provide advisory support. Final academic grading, viva examination marks, and proposal approvals are determined solely by faculty committee discretion.
        </span>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => { setActiveTab('viva'); setResultText(''); }}
          className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'viva' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Viva Voce Defense Questions
        </button>
        <button
          onClick={() => { setActiveTab('summary'); setResultText(''); }}
          className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'summary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Project Report Summarizer
        </button>
        <button
          onClick={() => { setActiveTab('feedback'); setResultText(''); }}
          className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'feedback' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Milestone Feedback Drafter
        </button>
        <button
          onClick={() => { setActiveTab('completeness'); setResultText(''); }}
          className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'completeness' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Proposal Completeness Check
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 cols: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader
              title="Project Parameters"
              subtitle="Supply project context to formulate tailored questions or feedback"
            />
            <CardBody className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Capstone Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Abstract / Excerpt
                </label>
                <textarea
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleGenerate}
                  isLoading={loading}
                  icon={Sparkles}
                  className="w-full"
                >
                  Generate {activeTab === 'viva' ? 'Viva Questions' : activeTab === 'summary' ? 'Executive Summary' : 'AI Analysis'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right 7 cols: Generated Result */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col">
            <CardHeader
              title="Advisory AI Recommendations"
              subtitle="Structured markdown evaluation output"
              action={
                resultText && (
                  <Button variant="outline" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                )
              }
            />
            <CardBody className="p-6 flex-1 overflow-y-auto">
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    Analyzing project architecture and formulating academic advice...
                  </p>
                </div>
              ) : resultText ? (
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 max-h-[520px] overflow-y-auto">
                  {resultText}
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-slate-400">
                  Select a tool and click Generate to view tailored viva questions, report summaries, or feedback drafts.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
