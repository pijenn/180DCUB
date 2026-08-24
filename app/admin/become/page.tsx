"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Search, 
  FileText, 
  Users,
  RefreshCw,
  Mail,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  fetchApplicants, 
  saveApplicant, 
  deleteApplicant, 
  fetchWritingTestSubmissions, 
  deleteWritingTestSubmission 
} from "./actions";
import { format } from "date-fns";

const DEPARTMENTS = [
  'ALL',
  'Human Resources',
  'Legal and Finance',
  'Marketing',
  'Consulting',
  'Client Acquisition',
  'Strategy and Growth',
];

export default function BecomeAdmin() {
  const [activeTab, setActiveTab] = useState<'applicants' | 'writing_tests'>('applicants');

  // Applicants State
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nim: "",
    name: "",
    email: "",
    status_1: true,
    status_2: false,
  });

  // Writing Test Submissions State
  const [writingSubmissions, setWritingSubmissions] = useState<any[]>([]);
  const [loadingWritingTests, setLoadingWritingTests] = useState(true);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadApplicants = async () => {
    setLoadingApplicants(true);
    const { success, data } = await fetchApplicants();
    if (success && data) {
      setApplicants(data);
    }
    setLoadingApplicants(false);
  };

  const loadWritingTests = async () => {
    setLoadingWritingTests(true);
    const { success, data } = await fetchWritingTestSubmissions(selectedDeptFilter, searchQuery);
    if (success && data) {
      setWritingSubmissions(data);
    }
    setLoadingWritingTests(false);
  };

  useEffect(() => {
    loadApplicants();
    loadWritingTests();
  }, []);

  useEffect(() => {
    if (activeTab === 'writing_tests') {
      loadWritingTests();
    }
  }, [selectedDeptFilter]);

  const handleSearchWritingTests = (e: React.FormEvent) => {
    e.preventDefault();
    loadWritingTests();
  };

  const handleOpenModal = (applicant: any = null) => {
    if (applicant) {
      setFormData({
        id: applicant.id,
        nim: applicant.nim,
        name: applicant.name,
        email: applicant.email,
        status_1: applicant.status_1,
        status_2: applicant.status_2,
      });
    } else {
      setFormData({
        id: "",
        nim: "",
        name: "",
        email: "",
        status_1: true,
        status_2: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = { ...formData };
    
    if (!payload.id) {
      delete (payload as any).id; // Let DB generate UUID
    }

    const { success, error } = await saveApplicant(payload);

    if (success) {
      setIsModalOpen(false);
      loadApplicants();
      toast.success("Applicant saved successfully!");
    } else {
      toast.error("Failed to save applicant: " + error);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this applicant?")) {
      const { success, error } = await deleteApplicant(id);
      if (success) {
        loadApplicants();
        toast.success("Applicant deleted successfully!");
      } else {
        toast.error("Failed to delete applicant: " + error);
      }
    }
  };

  const handleDeleteWritingTest = async (id: string) => {
    if (confirm("Are you sure you want to delete this writing test submission?")) {
      const { success, error } = await deleteWritingTestSubmission(id);
      if (success) {
        loadWritingTests();
        toast.success("Submission deleted successfully!");
      } else {
        toast.error("Failed to delete submission: " + error);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Become 180</h1>
          <p className="text-muted-foreground">Manage recruitment applicants and writing test submissions.</p>
        </div>

        {activeTab === 'applicants' ? (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Applicant</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={loadWritingTests}
              className="flex items-center space-x-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl font-medium hover:bg-muted/80 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <Link
              href="/admin/writing-tests"
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors self-start sm:self-auto text-sm"
            >
              <span>Dedicated View & Export</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'applicants'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Applicants Status (Batch 1 & 2)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-mono">
            {applicants.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('writing_tests')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'writing_tests'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Writing Test Submissions</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-mono font-bold">
            {writingSubmissions.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Applicants List */}
      {activeTab === 'applicants' && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loadingApplicants ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">NIM</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium text-center">Batch 1 (Status 1)</th>
                    <th className="px-6 py-4 font-medium text-center">Batch 2 (Status 2)</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No applicants found.
                      </td>
                    </tr>
                  ) : (
                    applicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground font-mono">
                          {applicant.nim}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {applicant.name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {applicant.email}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {applicant.status_1 ? (
                              <span className="flex items-center text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full text-xs font-semibold gap-1">
                                <CheckCircle className="w-3 h-3" /> Passed
                              </span>
                            ) : (
                              <span className="flex items-center text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full text-xs font-semibold gap-1">
                                <XCircle className="w-3 h-3" /> Failed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {applicant.status_2 ? (
                              <span className="flex items-center text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full text-xs font-semibold gap-1">
                                <CheckCircle className="w-3 h-3" /> Passed
                              </span>
                            ) : (
                              <span className="flex items-center text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full text-xs font-semibold gap-1">
                                <XCircle className="w-3 h-3" /> Failed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => handleOpenModal(applicant)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(applicant.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Writing Test Submissions */}
      {activeTab === 'writing_tests' && (
        <div className="space-y-4">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border">
            <form onSubmit={handleSearchWritingTests} className="flex gap-2 w-full sm:w-80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Name or NIM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90"
              >
                Search
              </button>
            </form>

            {/* Department Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground uppercase font-bold shrink-0">Department:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-card text-foreground">
                    {dept === 'ALL' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {loadingWritingTests ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Candidate Name</th>
                      <th className="px-6 py-4 font-medium">NIM</th>
                      <th className="px-6 py-4 font-medium">Department</th>
                      <th className="px-6 py-4 font-medium">Drive Submission</th>
                      <th className="px-6 py-4 font-medium">Submitted At</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {writingSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          No writing test submissions found.
                        </td>
                      </tr>
                    ) : (
                      writingSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground">{sub.name}</div>
                            {sub.user_email && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-primary/70" />
                                <span>{sub.user_email}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-muted-foreground">
                            {sub.nim}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                              {sub.department}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={sub.drive_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg text-xs transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Drive</span>
                              </a>
                              <button
                                onClick={() => copyToClipboard(sub.drive_link)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Copy link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                            {format(new Date(sub.created_at), "dd MMM yyyy, HH:mm")}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteWritingTest(sub.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              title="Delete submission"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for adding/editing applicants */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">{formData.id ? "Edit Applicant" : "Add New Applicant"}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium">NIM</label>
                <input
                  required
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  placeholder="e.g. 215150200..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  placeholder="e.g. john@student.ub.ac.id"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch 1 (Status 1)</label>
                  <select
                    value={formData.status_1 ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, status_1: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  >
                    <option value="true" className="text-black">Passed</option>
                    <option value="false" className="text-black">Failed</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch 2 (Status 2)</label>
                  <select
                    value={formData.status_2 ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, status_2: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  >
                    <option value="true" className="text-black">Passed</option>
                    <option value="false" className="text-black">Failed</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Applicant</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
