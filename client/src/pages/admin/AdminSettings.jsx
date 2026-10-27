import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, Sparkles, Database, Lock } from 'lucide-react';

export const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Institution System Settings"
        description="Global settings for authentication, AI models, storage backend, and session security policies."
      />

      <Card>
        <CardHeader
          title="System Architecture & Environment"
          subtitle="MentorHub AI Production-Style Configuration"
        />
        <CardBody className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Database Engine</p>
              <p className="text-slate-500">MongoDB / Mongoose ODM with automated transactional memory fallback</p>
            </div>
            <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-bold">
              Connected & Auto-Seeded
            </span>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-900">AI Integration Engine</p>
              <p className="text-slate-500">Google Gemini 1.5 API with intelligent resilient academic fallbacks</p>
            </div>
            <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 font-bold">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Document Storage Abstraction</p>
              <p className="text-slate-500">Multer local disk abstraction with support for Cloudinary / S3</p>
            </div>
            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded font-bold">
              Local Uploads (Max 25MB)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Authentication Scheme</p>
              <p className="text-slate-500">JWT (JSON Web Tokens) with bcrypt password hashing & role RBAC middleware</p>
            </div>
            <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-bold">
              Enforced
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
