"use client";

import { useEffect, useState, useMemo } from "react";
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
  ArrowRight,
  AlertTriangle,
  Check,
  ClipboardCopy
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  fetchApplicants, 
  saveApplicant, 
  saveMultipleApplicants,
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

interface ParsedApplicant {
  nim: string;
  name: string;
  email: string;
  status_1: boolean;
  status_2: boolean;
}

interface ParseError {
  line: number;
  raw: string;
  message: string;
}

function parseBulkInput(
  rawText: string,
  defaultStatus1: boolean,
  defaultStatus2: boolean
): { validApplicants: ParsedApplicant[]; parseErrors: ParseError[] } {
  if (!rawText.trim()) {
    return { validApplicants: [], parseErrors: [] };
  }

  const lines = rawText.split('\n');
  const validApplicants: ParsedApplicant[] = [];
  const parseErrors: ParseError[] = [];
  const seenNims = new Set<string>();

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    if (!trimmed) return; // Skip empty lines

    // Determine delimiter: '|', '\t', or ';'
    let parts: string[] = [];
    if (trimmed.includes('|')) {
      parts = trimmed.split('|').map((p) => p.trim());
    } else if (trimmed.includes('\t')) {
      parts = trimmed.split('\t').map((p) => p.trim());
    } else if (trimmed.includes(';')) {
      parts = trimmed.split(';').map((p) => p.trim());
    } else {
      parseErrors.push({
        line: lineNum,
        raw: trimmed,
        message: 'Must contain "|" separator between NIM, NAME, and EMAIL',
      });
      return;
    }

    if (parts.length < 3) {
      parseErrors.push({
        line: lineNum,
        raw: trimmed,
        message: 'Expected format: NIM | NAME | EMAIL (found fewer than 3 values)',
      });
      return;
    }

    const nim = parts[0];
    const name = parts[1];
    const email = parts[2];

    // Automatically skip header line if user included NIM | NAME | EMAIL
    if (
      nim.toLowerCase() === 'nim' &&
      name.toLowerCase() === 'name' &&
      email.toLowerCase().includes('email')
    ) {
      return;
    }

    if (!nim) {
      parseErrors.push({ line: lineNum, raw: trimmed, message: 'NIM is required' });
      return;
    }

    if (!name) {
      parseErrors.push({ line: lineNum, raw: trimmed, message: 'Name is required' });
      return;
    }

    if (!email) {
      parseErrors.push({ line: lineNum, raw: trimmed, message: 'Email is required' });
      return;
    }

    if (!email.includes('@')) {
      parseErrors.push({ line: lineNum, raw: trimmed, message: 'Invalid email format' });
      return;
    }

    // Optional status overrides if provided in columns 4 and 5
    let s1 = defaultStatus1;
    let s2 = defaultStatus2;
    if (parts[3]) {
      const lower = parts[3].toLowerCase();
      if (['passed', 'pass', 'true', '1', 'lolos'].includes(lower)) s1 = true;
      else if (['failed', 'fail', 'false', '0', 'tidak lolos'].includes(lower)) s1 = false;
    }
    if (parts[4]) {
      const lower = parts[4].toLowerCase();
      if (['passed', 'pass', 'true', '1', 'lolos'].includes(lower)) s2 = true;
      else if (['failed', 'fail', 'false', '0', 'tidak lolos'].includes(lower)) s2 = false;
    }

    if (seenNims.has(nim)) {
      const existingIdx = validApplicants.findIndex((a) => a.nim === nim);
      if (existingIdx !== -1) {
        validApplicants[existingIdx] = { nim, name, email, status_1: s1, status_2: s2 };
      }
    } else {
      seenNims.add(nim);
      validApplicants.push({
        nim,
        name,
        email,
        status_1: s1,
        status_2: s2,
      });
    }
  });

  return { validApplicants, parseErrors };
}

export default function BecomeAdmin() {
  const [activeTab, setActiveTab] = useState<'applicants' | 'writing_tests'>('applicants');

  // Applicants State
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [applicantSearch, setApplicantSearch] = useState("");
  const [applicantFilter, setApplicantFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'bulk' | 'single'>('bulk');
  const [isSaving, setIsSaving] = useState(false);

  // Single form data
  const [formData, setFormData] = useState({
    id: "",
    nim: "",
    name: "",
    email: "",
    status_1: true,
    status_2: false,
  });

  // Bulk form data
  const [bulkText, setBulkText] = useState("");
  const [bulkStatus1, setBulkStatus1] = useState(true);
  const [bulkStatus2, setBulkStatus2] = useState(false);

  // Parsing result
  const { validApplicants, parseErrors } = useMemo(() => {
    return parseBulkInput(bulkText, bulkStatus1, bulkStatus2);
  }, [bulkText, bulkStatus1, bulkStatus2]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      const q = applicantSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        app.nim?.toLowerCase().includes(q) ||
        app.name?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (applicantFilter === 'BATCH1_PASS') return app.status_1 === true;
      if (applicantFilter === 'BATCH1_FAIL') return app.status_1 === false;
      if (applicantFilter === 'BATCH2_PASS') return app.status_2 === true;
      if (applicantFilter === 'BATCH2_FAIL') return app.status_2 === false;
      return true;
    });
  }, [applicants, applicantSearch, applicantFilter]);

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

  const handleOpenModal = (applicant: any = null, mode: 'bulk' | 'single' = 'bulk') => {
    if (applicant) {
      setFormData({
        id: applicant.id,
        nim: applicant.nim,
        name: applicant.name,
        email: applicant.email,
        status_1: applicant.status_1,
        status_2: applicant.status_2,
      });
      setModalMode('single');
    } else {
      setFormData({
        id: "",
        nim: "",
        name: "",
        email: "",
        status_1: true,
        status_2: false,
      });
      setBulkText("");
      setModalMode(mode);
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

  const handleSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validApplicants.length === 0) {
      toast.error("No valid applicants found to import.");
      return;
    }

    setIsSaving(true);
    const { success, count, error } = await saveMultipleApplicants(validApplicants);

    if (success) {
      setIsModalOpen(false);
      setBulkText("");
      loadApplicants();
      toast.success(`Successfully saved ${count} applicant${count === 1 ? '' : 's'}!`);
    } else {
      toast.error("Failed to save applicants: " + error);
    }
    setIsSaving(false);
  };

  const sampleTemplate = `215150200111001 | Budi Santoso | budi@student.ub.ac.id
215150200111002 | Siti Rahma | siti@student.ub.ac.id
215150200111003 | Ahmad Fauzi | ahmad@student.ub.ac.id`;

  const handleInsertSample = () => {
    setBulkText(sampleTemplate);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText("NIM | NAME | EMAIL");
    toast.success("Template copied: NIM | NAME | EMAIL");
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
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenModal(null, 'bulk')}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors self-start sm:self-auto shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Bulk Input (NIM | NAME | EMAIL)</span>
            </button>
            <button
              onClick={() => handleOpenModal(null, 'single')}
              className="flex items-center space-x-2 bg-muted hover:bg-muted/80 text-foreground border border-border px-4 py-2 rounded-xl font-medium transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Single</span>
            </button>
          </div>
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
        <div className="space-y-4">
          {/* Filters & Search for Applicants */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border">
            <div className="relative flex-1 w-full sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search NIM, Name, or Email..."
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground uppercase font-bold shrink-0">Filter:</span>
              <select
                value={applicantFilter}
                onChange={(e) => setApplicantFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
              >
                <option value="ALL">All Applicants ({applicants.length})</option>
                <option value="BATCH1_PASS">Batch 1 Passed</option>
                <option value="BATCH1_FAIL">Batch 1 Failed</option>
                <option value="BATCH2_PASS">Batch 2 Passed</option>
                <option value="BATCH2_FAIL">Batch 2 Failed</option>
              </select>
            </div>
          </div>

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
                    {filteredApplicants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          {applicants.length === 0 ? "No applicants found." : "No applicants match your filter/search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredApplicants.map((applicant) => (
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
                              title="Edit applicant"
                            >
                              <Edit2 className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => handleDelete(applicant.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete applicant"
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
          <div className={`bg-card w-full ${modalMode === 'bulk' && !formData.id ? 'max-w-3xl' : 'max-w-lg'} rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all`}>
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {formData.id ? "Edit Applicant" : (modalMode === 'bulk' ? "Bulk Add Applicants" : "Add Single Applicant")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formData.id
                    ? "Update details for this applicant."
                    : (modalMode === 'bulk'
                        ? "Input multiple applicants using the template: NIM | NAME | EMAIL"
                        : "Enter details for an individual applicant.")}
                </p>
              </div>

              {/* Mode switch tabs if not editing existing applicant */}
              {!formData.id && (
                <div className="flex bg-muted p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setModalMode('bulk')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      modalMode === 'bulk'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Multiple (Bulk)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode('single')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      modalMode === 'single'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Single</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Modal Body: Bulk Mode */}
            {modalMode === 'bulk' && !formData.id ? (
              <form onSubmit={handleSaveBulk} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Template Guide Banner */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs uppercase font-bold tracking-wider text-primary">Input Template:</span>
                      <code className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
                        NIM | NAME | EMAIL
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      One applicant per line. Pipe (<code className="font-mono">|</code>) separated.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className="px-3 py-1.5 text-xs font-medium border border-border bg-background hover:bg-muted rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertSample}
                      className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      Insert Example
                    </button>
                  </div>
                </div>

                {/* Default Statuses for the Batch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Batch 1 (Status 1)
                    </label>
                    <select
                      value={bulkStatus1 ? "true" : "false"}
                      onChange={(e) => setBulkStatus1(e.target.value === "true")}
                      className="w-full px-3 py-2 border border-border rounded-xl bg-card text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="true">Passed</option>
                      <option value="false">Failed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Batch 2 (Status 2)
                    </label>
                    <select
                      value={bulkStatus2 ? "true" : "false"}
                      onChange={(e) => setBulkStatus2(e.target.value === "true")}
                      className="w-full px-3 py-2 border border-border rounded-xl bg-card text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="false">Failed</option>
                      <option value="true">Passed</option>
                    </select>
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Applicant Data List
                    </label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {validApplicants.length} valid / {bulkText.trim() ? bulkText.split('\n').filter(l => l.trim()).length : 0} lines
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"215150200111001 | Budi Santoso | budi@student.ub.ac.id\n215150200111002 | Siti Rahma | siti@student.ub.ac.id\n215150200111003 | Ahmad Fauzi | ahmad@student.ub.ac.id"}
                    className="w-full px-3.5 py-3 border border-border rounded-xl bg-muted/20 font-mono text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>

                {/* Parse Errors Warning */}
                {parseErrors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-xs space-y-1 text-destructive">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{parseErrors.length} line(s) have formatting issues:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                      {parseErrors.slice(0, 3).map((err, idx) => (
                        <li key={idx}>
                          <span className="font-semibold text-foreground">Line {err.line}:</span> {err.message} (<code className="font-mono text-[11px]">{err.raw}</code>)
                        </li>
                      ))}
                      {parseErrors.length > 3 && (
                        <li>...and {parseErrors.length - 3} more errors</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Parsed Preview Table */}
                {validApplicants.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Preview ({validApplicants.length} ready to save)
                      </span>
                      <span>Existing NIMs will be updated</span>
                    </div>
                    <div className="max-h-44 overflow-y-auto border border-border rounded-xl overflow-hidden bg-card text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-muted/60 text-muted-foreground text-[11px] uppercase font-mono sticky top-0">
                          <tr>
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">NIM</th>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2 text-center">Batch 1</th>
                            <th className="px-3 py-2 text-center">Batch 2</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {validApplicants.map((app, idx) => (
                            <tr key={idx} className="hover:bg-muted/30">
                              <td className="px-3 py-1.5 text-muted-foreground font-mono">{idx + 1}</td>
                              <td className="px-3 py-1.5 font-mono font-medium">{app.nim}</td>
                              <td className="px-3 py-1.5 font-medium">{app.name}</td>
                              <td className="px-3 py-1.5 text-muted-foreground">{app.email}</td>
                              <td className="px-3 py-1.5 text-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${app.status_1 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {app.status_1 ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${app.status_2 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {app.status_2 ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-4 flex justify-end space-x-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || validApplicants.length === 0}
                    className="flex items-center space-x-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving {validApplicants.length} Applicants...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Save {validApplicants.length > 0 ? `${validApplicants.length} Applicants` : 'Applicants'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Modal Body: Single Applicant Form */
              <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
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
                    <span>{formData.id ? "Update Applicant" : "Save Applicant"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
