"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FileCheck,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Download,
  RefreshCw,
  Loader2,
  Calendar,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  ArrowUpDown,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Eye,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchWritingTestSubmissions, deleteWritingTestSubmission } from "../become/actions";
import { format } from "date-fns";

const DEPARTMENTS = [
  "ALL",
  "Human Resources",
  "Legal and Finance",
  "Marketing",
  "Consulting",
  "Client Acquisition",
  "Strategy and Growth",
];

const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Human Resources": {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
  },
  "Legal and Finance": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
  },
  "Marketing": {
    bg: "bg-pink-500/10",
    text: "text-pink-500",
    border: "border-pink-500/20",
  },
  "Consulting": {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
  },
  "Client Acquisition": {
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
    border: "border-indigo-500/20",
  },
  "Strategy and Growth": {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
  },
};

export default function WritingTestsAdminPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { success, data } = await fetchWritingTestSubmissions();
    if (success && data) {
      setSubmissions(data);
    } else {
      toast.error("Failed to load writing test submissions");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Department counts for filter badges
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: submissions.length };
    DEPARTMENTS.slice(1).forEach((dept) => {
      counts[dept] = 0;
    });
    submissions.forEach((sub) => {
      if (counts[sub.department] !== undefined) {
        counts[sub.department] += 1;
      }
    });
    return counts;
  }, [submissions]);

  // Filtered & Sorted Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((sub) => {
        // Department filter
        if (selectedDepartment !== "ALL" && sub.department !== selectedDepartment) {
          return false;
        }

        // Search query filter (Name, NIM, Email, Phone)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = sub.name?.toLowerCase().includes(q);
          const matchNim = sub.nim?.toLowerCase().includes(q);
          const matchEmail = sub.user_email?.toLowerCase().includes(q);
          const matchPhone = sub.user_phone?.toLowerCase().includes(q);
          const matchDept = sub.department?.toLowerCase().includes(q);
          return matchName || matchNim || matchEmail || matchPhone || matchDept;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "name") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      });
  }, [submissions, selectedDepartment, searchQuery, sortBy]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = submissions.length;
    
    // Submissions today
    const today = new Date().toDateString();
    const todayCount = submissions.filter((s) => new Date(s.created_at).toDateString() === today).length;

    // Top applied department
    let topDept = "None";
    let topCount = 0;
    Object.entries(departmentCounts).forEach(([dept, count]) => {
      if (dept !== "ALL" && count > topCount) {
        topCount = count;
        topDept = dept;
      }
    });

    return { total, todayCount, topDept, topCount };
  }, [submissions, departmentCounts]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete submission from ${name}?`)) {
      const { success, error } = await deleteWritingTestSubmission(id);
      if (success) {
        toast.success("Submission deleted successfully!");
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selectedCandidate?.id === id) {
          setIsDetailOpen(false);
          setSelectedCandidate(null);
        }
      } else {
        toast.error("Failed to delete submission: " + error);
      }
    }
  };

  const copyToClipboard = (text: string, label = "Link") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleCopyAllLinks = () => {
    if (filteredSubmissions.length === 0) {
      toast.error("No submissions to copy");
      return;
    }

    const content = filteredSubmissions
      .map((s, idx) => `${idx + 1}. ${s.name} (${s.nim}) - ${s.department}\nDrive: ${s.drive_link}\n`)
      .join("\n");

    navigator.clipboard.writeText(content);
    toast.success(`Copied ${filteredSubmissions.length} submissions links to clipboard!`);
  };

  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error("No submissions to export");
      return;
    }

    const headers = [
      "No",
      "Candidate Name",
      "NIM",
      "Department",
      "Google Drive Link",
      "Account Email",
      "Account Phone Number",
      "Submitted At",
    ];

    const rows = filteredSubmissions.map((sub, idx) => [
      idx + 1,
      `"${(sub.name || "").replace(/"/g, '""')}"`,
      `"${(sub.nim || "").replace(/"/g, '""')}"`,
      `"${(sub.department || "").replace(/"/g, '""')}"`,
      `"${(sub.drive_link || "").replace(/"/g, '""')}"`,
      `"${(sub.user_email || "").replace(/"/g, '""')}"`,
      `"${(sub.user_phone || "").replace(/"/g, '""')}"`,
      `"${format(new Date(sub.created_at), "yyyy-MM-dd HH:mm:ss")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = format(new Date(), "yyyy-MM-dd");
    link.setAttribute("download", `180dc_writing_tests_${selectedDepartment.toLowerCase().replace(/\s+/g, "_")}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV file downloaded successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Recruitment Stage 2</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Writing Test Submissions</h1>
          <p className="text-muted-foreground mt-1">
            Review candidate case responses, access Google Drive submissions, and export recruitment evaluation data.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleCopyAllLinks}
            disabled={filteredSubmissions.length === 0}
            className="flex items-center space-x-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
            title="Copy formatted list of all visible submissions"
          >
            <Copy className="w-4 h-4" />
            <span>Copy All Links</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredSubmissions.length === 0}
            className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
            <h3 className="text-2xl font-bold">{stats.total} Candidate{stats.total === 1 ? "" : "s"}</h3>
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Submitted Today</p>
            <h3 className="text-2xl font-bold">{stats.todayCount} Submission{stats.todayCount === 1 ? "" : "s"}</h3>
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Top Division</p>
            <h3 className="text-lg font-bold truncate" title={stats.topDept}>{stats.topDept}</h3>
            <p className="text-xs text-muted-foreground">{stats.topCount} submissions</p>
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Filtered View</p>
            <h3 className="text-2xl font-bold">{filteredSubmissions.length} Showing</h3>
          </div>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Layers className="w-4 h-4" />
          <span>Filter by Department</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((dept) => {
            const count = departmentCounts[dept] || 0;
            const isSelected = selectedDepartment === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md font-semibold"
                    : "bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <span>{dept === "ALL" ? "All Departments" : dept}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Bar: Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, NIM, email, division..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground font-semibold uppercase shrink-0">Sort:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Candidate Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading writing test submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">No submissions found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery || selectedDepartment !== "ALL"
                ? "Try adjusting your search criteria or division filter."
                : "Candidate writing test responses will appear here once submitted."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Candidate</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Google Drive Link</th>
                  <th className="px-6 py-4 font-semibold">Submitter Account</th>
                  <th className="px-6 py-4 font-semibold">Submitted At</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubmissions.map((sub) => {
                  const deptStyle = DEPT_COLORS[sub.department] || {
                    bg: "bg-primary/10",
                    text: "text-primary",
                    border: "border-primary/20",
                  };

                  return (
                    <tr key={sub.id} className="hover:bg-muted/20 transition-colors group">
                      {/* Candidate Name & NIM */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20 text-xs">
                            {(sub.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {sub.name}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                              NIM: {sub.nim}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${deptStyle.bg} ${deptStyle.text} ${deptStyle.border}`}
                        >
                          {sub.department}
                        </span>
                      </td>

                      {/* Google Drive Link */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <a
                            href={sub.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 hover:bg-primary hover:text-primary-foreground text-foreground font-medium rounded-lg text-xs transition-colors group/btn shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Drive</span>
                          </a>
                          <button
                            onClick={() => copyToClipboard(sub.drive_link, "Drive link")}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Copy Drive URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Submitter Account Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {sub.user_email ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                              <span className="truncate max-w-[180px]" title={sub.user_email}>
                                {sub.user_email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No email linked</span>
                          )}

                          {sub.user_phone && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{sub.user_phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Submitted Time */}
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                        {sub.created_at ? format(new Date(sub.created_at), "dd MMM yyyy, HH:mm") : "-"}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setSelectedCandidate(sub);
                              setIsDetailOpen(true);
                            }}
                            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(sub.id, sub.name)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {isDetailOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                  {(selectedCandidate.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedCandidate.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">NIM: {selectedCandidate.nim}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedCandidate(null);
                }}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Department Badge */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase">Applied Department</span>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      DEPT_COLORS[selectedCandidate.department]?.bg || "bg-primary/10"
                    } ${
                      DEPT_COLORS[selectedCandidate.department]?.text || "text-primary"
                    } ${
                      DEPT_COLORS[selectedCandidate.department]?.border || "border-primary/20"
                    }`}
                  >
                    {selectedCandidate.department}
                  </span>
                </div>
              </div>

              {/* Google Drive Link Box */}
              <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Google Drive Link</span>
                  <button
                    onClick={() => copyToClipboard(selectedCandidate.drive_link, "Drive URL")}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-primary break-all bg-background/50 p-2.5 rounded-xl border border-border">
                  {selectedCandidate.drive_link}
                </p>
                <a
                  href={selectedCandidate.drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Drive</span>
                </a>
              </div>

              {/* User Account Details */}
              <div className="space-y-3 p-4 rounded-2xl bg-card border border-border text-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase block">Candidate Account Info</span>
                
                <div className="flex items-center justify-between text-xs py-1 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <span className="font-medium text-foreground">{selectedCandidate.user_email || "N/A"}</span>
                </div>

                {selectedCandidate.user_phone && (
                  <div className="flex items-center justify-between text-xs py-1 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone / WhatsApp
                    </span>
                    <span className="font-mono font-medium text-emerald-500">{selectedCandidate.user_phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Submitted At
                  </span>
                  <span className="font-mono text-foreground">
                    {selectedCandidate.created_at
                      ? format(new Date(selectedCandidate.created_at), "dd MMMM yyyy, HH:mm:ss")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center">
              <button
                onClick={() => handleDelete(selectedCandidate.id, selectedCandidate.name)}
                className="px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Submission</span>
              </button>

              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedCandidate(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
