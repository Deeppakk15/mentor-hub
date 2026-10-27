import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Search,
  FileCheck2,
  Milestone,
  HelpCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user, switchDemoAccount } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState('student');

  const handleQuickDemo = async (role) => {
    try {
      await switchDemoAccount(role);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      navigate('/login');
    }
  };

  const featureCards = [
    {
      icon: Users,
      title: 'Guided Modules',
      description: 'Step-by-step paths for project planning, goal setting, and team coordination.',
    },
    {
      icon: Search,
      title: 'Real Mentors',
      description: 'Connect directly with faculty advisors who review milestones and give feedback.',
    },
    {
      icon: FileCheck2,
      title: 'Smart Coach Feedback',
      description: 'Get automated suggestions to make your goals and proposals clear and actionable.',
    },
    {
      icon: Milestone,
      title: 'Milestone Tracking',
      description: 'Keep your project deliverables on schedule with clear progress indicators.',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Start a Path', desc: 'Choose a project or goal-setting module with guided steps.' },
    { step: '02', title: 'Draft Your Plan', desc: 'Write your goals and let the AI coach refine them.' },
    { step: '03', title: 'Submit for Review', desc: 'Share your drafted plan with your assigned mentor.' },
    { step: '04', title: 'Get Feedback', desc: 'Receive notes and guidance from your mentor to finish strong.' },
  ];

  const faqs = [
    {
      q: 'How does step-by-step guidance work?',
      a: 'Each project is broken into clear modules. You complete each step, receive tips from the AI coach, and submit it for your mentor to review.',
    },
    {
      q: 'Can students invite teammates?',
      a: 'Yes, students can create a team and invite classmates by college email to work on milestones together.',
    },
    {
      q: 'Who reviews the student submissions?',
      a: 'Your assigned faculty mentor reviews all drafted proposals, project milestones, and final submissions.',
    },
    {
      q: 'What is the role of the AI coach?',
      a: 'The coach provides suggestions, SMART goal checks, and review tips. All final approvals belong to real faculty mentors.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* 1. Minimalist Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Mark matching screenshot */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-tl-xl rounded-tr-md rounded-br-xl rounded-bl-md bg-teal-600 flex items-center justify-center text-white shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
            </div>
            <span className="text-lg font-bold text-[#0B1A2D] tracking-tight">
              MentorHub
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#mentors" className="hover:text-slate-900 transition-colors">Mentors</a>
            <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-5">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(`/${user?.role}/dashboard`)}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#0B1A2D] text-white hover:bg-[#071322] transition-all shadow-xs cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#0B1A2D] text-white hover:bg-[#071322] transition-all shadow-xs"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-slate-100 mt-3 space-y-2 text-xs font-medium text-slate-600">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-2 hover:bg-slate-50 rounded">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-2 hover:bg-slate-50 rounded">How it works</a>
            <a href="#mentors" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-2 hover:bg-slate-50 rounded">Mentors</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 px-2 hover:bg-slate-50 rounded">About</a>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link to="/login" className="flex-1 text-center py-2 border border-slate-200 rounded-lg">Sign in</Link>
              <Link to="/register" className="flex-1 text-center py-2 bg-[#0B1A2D] text-white rounded-lg">Get started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section with Subtle Square Grid */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-8 overflow-hidden [background-size:40px_40px] [background-image:linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-5 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0B1A2D] tracking-tight leading-[1.12]">
                Mentorship,<br />
                guided step by<br />
                step.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-md leading-relaxed mt-6 mb-8">
                Mentees work through guided modules with an AI voice coach, submit assignments, and get feedback from real mentors.
              </p>

              <div className="flex items-center gap-3">
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-lg bg-[#0B1A2D] text-white font-medium text-xs sm:text-sm hover:bg-[#071322] transition-all shadow-xs cursor-pointer"
                >
                  Get started
                </Link>
                <a
                  href="#how-it-works"
                  className="px-6 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 transition-all shadow-2xs"
                >
                  See how it works
                </a>
              </div>

              {/* Supported By Strip */}
              <div className="mt-14 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  SUPPORTED BY
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                  <span>TMU Social Ventures Zone</span>
                  <span>Access Ventures Fellowship</span>
                  <span>Friends Career Center</span>
                </div>
              </div>

              {/* Discreet 1-Click Demo Buttons for Testing */}
              <div className="mt-5 flex items-center gap-2 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">1-Click Demos:</span>
                <button
                  onClick={() => handleQuickDemo('student')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all cursor-pointer text-[11px]"
                >
                  Student (Harsh)
                </button>
                <button
                  onClick={() => handleQuickDemo('faculty')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all cursor-pointer text-[11px]"
                >
                  Mentor (Dr. Harikesh)
                </button>
                <button
                  onClick={() => handleQuickDemo('admin')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all cursor-pointer text-[11px]"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Right Column: The Next Step Studio UI Preview Card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xl p-5 sm:p-6 text-slate-900 w-full text-left">
                {/* Studio Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-teal-600 uppercase block">
                      NEXT STEP STUDIO
                    </span>
                    <h3 className="text-base font-bold text-[#0B1A2D] mt-0.5">
                      Goal Setting Path
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    In progress
                  </span>
                </div>

                {/* 3-Column Studio Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4">
                  {/* 1. Journey Rail (cols 3) */}
                  <div className="md:col-span-3 space-y-2.5">
                    <p className="text-[11px] font-medium text-slate-400 mb-2">Journey</p>

                    <div className="text-xs space-y-2">
                      <div className="px-1 text-slate-400">
                        <span className="font-semibold text-slate-600 block text-[11px]">01 What goals are</span>
                        <span className="text-[10px] text-slate-400">Done</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200 text-sky-950">
                        <span className="font-semibold block text-[11px]">02 Draft your plan</span>
                        <span className="text-[10px] text-sky-600 font-medium">Now</span>
                      </div>

                      <div className="px-1 text-slate-400">
                        <span className="font-semibold text-slate-600 block text-[11px]">03 Coach review</span>
                        <span className="text-[10px] text-slate-400">Next</span>
                      </div>

                      <div className="px-1 text-slate-400">
                        <span className="font-semibold text-slate-400 block text-[11px]">04 Mentor feedback</span>
                        <span className="text-[10px] text-slate-400">Locked</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Main Step Card (cols 6) */}
                  <div className="md:col-span-6 md:border-l md:border-slate-100 md:pl-4 space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-medium">Module 1 / Step 2</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                        Assignment
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Draft your Goal Plan</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        Write two goals you want to work on. The coach helps you make them specific before your mentor reviews them.
                      </p>
                    </div>

                    {/* Goal 1 Card */}
                    <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">Goal 1</span>
                        <span className="text-[10px] font-semibold text-emerald-600">SMART check ready</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Improve math homework consistency by completing assignments before Friday each week.
                      </p>
                    </div>

                    {/* Goal 2 Card */}
                    <div className="rounded-xl border border-dashed border-slate-300 p-3 space-y-1">
                      <span className="font-bold text-xs text-slate-900 block">Goal 2</span>
                      <p className="text-xs text-slate-400">
                        Add one more goal when you are ready.
                      </p>
                    </div>

                    {/* Pill tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        Reflection saved
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        Draft in progress
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                        Mentor review next
                      </span>
                    </div>
                  </div>

                  {/* 3. Coach & Mentor Sidebar (cols 3) */}
                  <div className="md:col-span-3 md:border-l md:border-slate-100 md:pl-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Coach</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Voice ready
                      </span>
                    </div>

                    {/* Coach tip box */}
                    <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-[11px] text-sky-950 leading-relaxed">
                      Make Goal 1 easier to measure by adding how many assignments you will complete each week.
                    </div>

                    {/* Mentor note box */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                      Mentor note: Ask what support the mentee needs to keep this realistic.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-slate-100">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-2 block">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1A2D] tracking-tight">
            Built for guided, meaningful mentorship
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Everything mentees and mentors need to stay on track.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-teal-700 flex items-center justify-center mb-4 border border-slate-100">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1A2D] mb-1.5">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-2 block">
              How it works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1A2D] tracking-tight">
              A simple 4-step path to progress
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {workflowSteps.map((wf, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xl font-bold text-teal-600 font-mono tracking-tight block mb-2">{wf.step}</span>
                <h4 className="text-xs font-bold text-slate-900 mb-1">{wf.title}</h4>
                <p className="text-xs text-slate-500 leading-normal">{wf.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Mentors Section */}
      <section id="mentors" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-2 block">
            Mentors
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1A2D] tracking-tight">
            Connect with dedicated faculty advisors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Experienced mentors ready to guide your next milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 font-bold text-sm flex items-center justify-center mb-3">
              HS
            </div>
            <h4 className="text-sm font-bold text-slate-900">Dr. Harikesh Singh</h4>
            <span className="text-[11px] text-teal-700 font-semibold block mt-0.5">Faculty Mentor</span>
            <p className="text-xs text-slate-500 mt-1">Computer Science & Engineering</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-700 font-bold text-sm flex items-center justify-center mb-3">
              RS
            </div>
            <h4 className="text-sm font-bold text-slate-900">Rashmi Singh</h4>
            <span className="text-[11px] text-sky-700 font-semibold block mt-0.5">Faculty Mentor</span>
            <p className="text-xs text-slate-500 mt-1">Information Technology</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center mb-3">
              HS
            </div>
            <h4 className="text-sm font-bold text-slate-900">Harendra Singh</h4>
            <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">Faculty Mentor</span>
            <p className="text-xs text-slate-500 mt-1">Computer Science & Engineering</p>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="about" className="py-20 px-4 sm:px-8 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-2 block">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1A2D] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 text-left">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-20 px-4 sm:px-8 text-center bg-white border-t border-slate-100">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0B1A2D] tracking-tight mb-3">
            Start your guided path today
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-8">
            Create an account in seconds to begin working through your project milestones with your team and mentor.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-lg bg-[#0B1A2D] text-white font-medium text-xs sm:text-sm hover:bg-[#071322] transition-all shadow-xs"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-200 transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer matching minimalist aesthetic */}
      <footer className="py-10 px-4 sm:px-8 bg-white border-t border-slate-100 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-teal-600 flex items-center justify-center text-white">
              <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
            </div>
            <span className="font-bold text-[#0B1A2D] text-sm">MentorHub</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#mentors" className="hover:text-slate-900 transition-colors">Mentors</a>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Sign in</Link>
          </div>

          <p className="text-slate-400">
            © {new Date().getFullYear()} MentorHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
