import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';
import { toast } from 'sonner';
import { Tag, Plus } from 'lucide-react';

export const ProjectDomainsPage = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/domains');
      setDomains(res.data.domains || []);
    } catch (err) {
      console.error('Failed to load domains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/admin/domains', { name, description });
      toast.success('Project domain category added.');
      setShowModal(false);
      setName('');
      setDescription('');
      fetchDomains();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add domain.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Domains & Categories"
        description="Database-driven project domain taxonomy used across proposal drafting, mentor discovery, and institutional analytics."
        actions={
          <Button icon={Plus} size="sm" onClick={() => setShowModal(true)}>
            Add Project Domain
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {domains.map((dom) => (
          <Card key={dom._id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{dom.name}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {dom.description || 'Capstone and thesis project domain category.'}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project Domain"
        subtitle="This category will be available in student proposal forms"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Domain Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quantum Computing & Cryptography"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Scope
            </label>
            <textarea
              rows={3}
              placeholder="Scope of projects categorized under this domain..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Save Domain
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
