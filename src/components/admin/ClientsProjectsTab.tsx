import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Client, MarketingProject, ProjectStatus, ClientStatus } from '../../types.js';
import { getAuthHeaders } from '../../lib/authHeader.js';

interface ClientsProjectsTabProps {
  token: string;
}

export const ClientsProjectsTab: React.FC<ClientsProjectsTabProps> = ({ token }) => {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'clients'>('projects');
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<MarketingProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showClientModal, setShowClientModal] = useState<Client | null>(null);
  const [showProjectModal, setShowProjectModal] = useState<MarketingProject | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders(token);
      const [resClients, resProjects] = await Promise.all([
        fetch('/api/admin/clients', { headers }),
        fetch('/api/admin/projects', { headers }),
      ]);
      const jsonClients = await resClients.json();
      const jsonProjects = await resProjects.json();

      if (jsonClients.success) setClients(jsonClients.data || []);
      if (jsonProjects.success) setProjects(jsonProjects.data || []);
    } catch (err) {
      console.error('Failed to load clients and projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Client actions
  const handleSaveClient = async (clientData: Client) => {
    try {
      const isEdit = clients.some((c) => c.id === clientData.id);
      const url = isEdit ? `/api/admin/clients/${clientData.id}` : '/api/admin/clients';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token) },
        body: JSON.stringify(clientData),
      });
      if (res.ok) {
        setShowClientModal(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error saving client:', err);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!window.confirm(`Delete client "${name}"?`)) return;
    try {
      await fetch(`/api/admin/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Project actions
  const handleSaveProject = async (projectData: MarketingProject) => {
    try {
      const isEdit = projects.some((p) => p.id === projectData.id);
      const url = isEdit ? `/api/admin/projects/${projectData.id}` : '/api/admin/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token) },
        body: JSON.stringify(projectData),
      });
      if (res.ok) {
        setShowProjectModal(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const handleUpdateProjectStatus = async (id: string, status: ProjectStatus) => {
    try {
      await fetch(`/api/admin/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token) },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error('Error updating project status:', err);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Delete project "${title}"?`)) return;
    try {
      await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const projectStatusStyles: Record<ProjectStatus, { bg: string; text: string }> = {
    'In Progress': { bg: 'bg-blue-100 text-blue-800', text: 'text-blue-800' },
    Review: { bg: 'bg-amber-100 text-amber-800', text: 'text-amber-800' },
    Completed: { bg: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-800' },
    'On Hold': { bg: 'bg-neutral-100 text-neutral-700', text: 'text-neutral-700' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Client &amp; Marketing Project Management
          </h1>
          <p className="text-xs text-neutral-500">
            Track active client retainers, deliverables, campaign timelines, and budgets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSubTab === 'projects' ? (
            <button
              type="button"
              onClick={() =>
                setShowProjectModal({
                  id: `proj-${Date.now()}`,
                  title: '',
                  clientName: clients[0]?.company || '',
                  clientId: clients[0]?.id || '',
                  serviceCategory: 'Google & Meta Paid Ads',
                  status: 'In Progress',
                  deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                  budget: '₹25,000 / mo',
                  description: '',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
              }
              className="inline-flex items-center gap-1.5 bg-[#28651B] hover:bg-[#1C4813] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-[#D9A51B]" />
              <span>New Marketing Project</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setShowClientModal({
                  id: `client-${Date.now()}`,
                  name: '',
                  company: '',
                  email: '',
                  phone: '',
                  status: 'Active',
                  totalProjects: 1,
                  notes: '',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
              }
              className="inline-flex items-center gap-1.5 bg-[#28651B] hover:bg-[#1C4813] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#D9A51B]" />
              <span>Add New Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Control */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('projects')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'projects'
              ? 'bg-[#28651B] text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Marketing Projects ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('clients')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'clients'
              ? 'bg-[#28651B] text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Agency Clients ({clients.length})
        </button>
      </div>

      {/* 1. MARKETING PROJECTS VIEW */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#28651B] mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-neutral-300 p-8">
              <Briefcase className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No active projects</h4>
              <p className="text-xs text-neutral-500 mt-1">Click "New Marketing Project" to create your first deliverable.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => {
                const badge = projectStatusStyles[proj.status] || projectStatusStyles['In Progress'];
                return (
                  <div
                    key={proj.id}
                    className="bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 truncate">
                          {proj.serviceCategory}
                        </span>
                        <select
                          value={proj.status}
                          onChange={(e) => handleUpdateProjectStatus(proj.id, e.target.value as ProjectStatus)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-current cursor-pointer ${badge.bg}`}
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                        {proj.title}
                      </h3>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mt-1 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#28651B]" />
                        <span>Client: {proj.clientName}</span>
                      </p>

                      {proj.description && (
                        <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-semibold">DEADLINE</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          {proj.deadline}
                        </span>
                      </div>

                      {proj.budget && (
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 block font-semibold">BUDGET</span>
                          <span className="font-bold text-[#28651B] dark:text-[#D9A51B]">{proj.budget}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => setShowProjectModal(proj)}
                          className="p-1 text-neutral-400 hover:text-[#28651B] cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id, proj.title)}
                          className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. CLIENTS VIEW */}
      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#28651B] mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-neutral-300 p-8">
              <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No clients stored</h4>
              <p className="text-xs text-neutral-500 mt-1">Add clients to maintain relationships and associate projects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#28651B] text-[#D9A51B] font-bold text-sm flex items-center justify-center shadow-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {c.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs font-semibold text-[#28651B] dark:text-[#D9A51B]">{c.company}</p>

                    <div className="mt-3 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                      <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:underline">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{c.email}</span>
                      </a>
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:underline">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{c.phone}</span>
                        </a>
                      )}
                    </div>

                    {c.notes && (
                      <p className="text-[11px] text-neutral-500 bg-neutral-50 dark:bg-neutral-750 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-700 mt-3">
                        {c.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">{c.totalProjects} Projects Managed</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowClientModal(c)}
                        className="p-1 text-neutral-400 hover:text-[#28651B] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(c.id, c.name)}
                        className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {showProjectModal.title ? 'Edit Marketing Project' : 'Create New Marketing Project'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={showProjectModal.title}
                  onChange={(e) => setShowProjectModal({ ...showProjectModal, title: e.target.value })}
                  placeholder="e.g. Diwali Mega Viral Reels Campaign"
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={showProjectModal.clientName}
                    onChange={(e) => setShowProjectModal({ ...showProjectModal, clientName: e.target.value })}
                    placeholder="e.g. Sharma Sweets"
                    className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Service Category</label>
                  <input
                    type="text"
                    value={showProjectModal.serviceCategory}
                    onChange={(e) => setShowProjectModal({ ...showProjectModal, serviceCategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Status</label>
                  <select
                    value={showProjectModal.status}
                    onChange={(e) => setShowProjectModal({ ...showProjectModal, status: e.target.value as ProjectStatus })}
                    className="w-full px-2 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-xs"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Deadline</label>
                  <input
                    type="date"
                    value={showProjectModal.deadline}
                    onChange={(e) => setShowProjectModal({ ...showProjectModal, deadline: e.target.value })}
                    className="w-full px-2 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Budget</label>
                  <input
                    type="text"
                    value={showProjectModal.budget || ''}
                    onChange={(e) => setShowProjectModal({ ...showProjectModal, budget: e.target.value })}
                    placeholder="₹35,000"
                    className="w-full px-2 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Project Description &amp; Scope</label>
                <textarea
                  rows={3}
                  value={showProjectModal.description}
                  onChange={(e) => setShowProjectModal({ ...showProjectModal, description: e.target.value })}
                  placeholder="Goals, deliverables, video count, target audience..."
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowProjectModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveProject(showProjectModal)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#28651B] text-white cursor-pointer"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {showClientModal.name ? 'Edit Client' : 'Add New Client'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={showClientModal.name}
                  onChange={(e) => setShowClientModal({ ...showClientModal, name: e.target.value })}
                  placeholder="e.g. Rohit Sharma"
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={showClientModal.company}
                  onChange={(e) => setShowClientModal({ ...showClientModal, company: e.target.value })}
                  placeholder="e.g. Sharma Sweets & Bakers"
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={showClientModal.email}
                    onChange={(e) => setShowClientModal({ ...showClientModal, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={showClientModal.phone}
                    onChange={(e) => setShowClientModal({ ...showClientModal, phone: e.target.value })}
                    placeholder="+91 98120-44552"
                    className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Status</label>
                <select
                  value={showClientModal.status}
                  onChange={(e) => setShowClientModal({ ...showClientModal, status: e.target.value as ClientStatus })}
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-xs"
                >
                  <option value="Active">Active Retainer</option>
                  <option value="Lead">Prospective Lead</option>
                  <option value="Past">Past Client</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={showClientModal.notes || ''}
                  onChange={(e) => setShowClientModal({ ...showClientModal, notes: e.target.value })}
                  placeholder="Client requirements, contract notes, follow-up preferences..."
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowClientModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveClient(showClientModal)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#28651B] text-white cursor-pointer"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
