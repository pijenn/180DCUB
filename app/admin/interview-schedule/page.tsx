"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  CalendarCheck2, 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Check, 
  Download,
  Building2,
  Layers,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  DEPARTMENTS, 
  INTERVIEW_DATES, 
  TIME_SLOTS, 
  normalizePhoneNumber, 
  generateWhatsAppLink 
} from "@/lib/interviewConstants";
import { 
  fetchPanelists, 
  createPanelistWithSlots, 
  deletePanelist, 
  fetchBookedInterviews, 
  adminCancelBooking,
  type PanelistPayload,
  type SlotPayload
} from "./actions";

export default function AdminInterviewSchedulePage() {
  const [activeTab, setActiveTab] = useState<"panelists" | "bookings">("panelists");
  
  // Data states
  const [panelists, setPanelists] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filters for Bookings
  const [bookingSearch, setBookingSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterDate, setFilterDate] = useState("ALL");

  // Modal: Add Panelist
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingPanelist, setSavingPanelist] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0].name);
  const [division, setDivision] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Record<string, Set<string>>>({}); // dateStr -> Set of slotId
  const [currentDateTab, setCurrentDateTab] = useState(INTERVIEW_DATES[0].dateStr);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Modal: Cancel Booking
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Available divisions for currently selected department
  const currentDeptConfig = useMemo(() => {
    return DEPARTMENTS.find((d) => d.name === department) || DEPARTMENTS[0];
  }, [department]);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [panelistsRes, bookingsRes] = await Promise.all([
        fetchPanelists(),
        fetchBookedInterviews(),
      ]);

      if (panelistsRes.success) {
        setPanelists(panelistsRes.data || []);
      } else {
        toast.error(panelistsRes.error || "Failed to load panelists");
      }

      if (bookingsRes.success) {
        setBookings(bookingsRes.data || []);
      } else {
        toast.error(bookingsRes.error || "Failed to load bookings");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Reset form when modal opens
  const handleOpenAddModal = () => {
    setName("");
    setDepartment(DEPARTMENTS[0].name);
    setDivision(DEPARTMENTS[0].divisions[0] || "");
    setPhone("62");
    // initialize empty slots map
    const initialSlots: Record<string, Set<string>> = {};
    INTERVIEW_DATES.forEach((d) => {
      initialSlots[d.dateStr] = new Set();
    });
    setSelectedSlots(initialSlots);
    setCurrentDateTab(INTERVIEW_DATES[0].dateStr);
    setIsAddModalOpen(true);
    setShowConfirmModal(false);
  };

  // Toggle slot selection
  const handleToggleSlot = (dateStr: string, slotId: string) => {
    setSelectedSlots((prev) => {
      const updated = { ...prev };
      const dateSet = new Set(updated[dateStr] || []);
      if (dateSet.has(slotId)) {
        dateSet.delete(slotId);
      } else {
        dateSet.add(slotId);
      }
      updated[dateStr] = dateSet;
      return updated;
    });
  };

  // Quick slot actions
  const handleSelectAllDay = (dateStr: string) => {
    setSelectedSlots((prev) => {
      const updated = { ...prev };
      updated[dateStr] = new Set(TIME_SLOTS.map((s) => s.id));
      return updated;
    });
  };

  const handleClearDay = (dateStr: string) => {
    setSelectedSlots((prev) => {
      const updated = { ...prev };
      updated[dateStr] = new Set();
      return updated;
    });
  };

  const handleSelectRange = (dateStr: string, startIdx: number, endIdx: number) => {
    setSelectedSlots((prev) => {
      const updated = { ...prev };
      const dateSet = new Set(updated[dateStr] || []);
      TIME_SLOTS.slice(startIdx, endIdx).forEach((s) => dateSet.add(s.id));
      updated[dateStr] = dateSet;
      return updated;
    });
  };

  // Total selected slots count
  const totalSlotsCount = useMemo(() => {
    let count = 0;
    Object.values(selectedSlots).forEach((set) => {
      count += set.size;
    });
    return count;
  }, [selectedSlots]);

  // Validation before confirmation prompt
  const handleValidateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter panelist name");
      return;
    }
    const cleanPhone = normalizePhoneNumber(phone);
    if (!cleanPhone.startsWith("62") || cleanPhone.length < 10) {
      toast.error("Phone number must start with 62 (e.g. 628123456789)");
      return;
    }
    if (totalSlotsCount === 0) {
      toast.error("Please select at least one available interview slot");
      return;
    }
    setShowConfirmModal(true);
  };

  // Submit new panelist and slots
  const handleSavePanelist = async () => {
    setSavingPanelist(true);
    try {
      const slotsPayload: SlotPayload[] = [];
      Object.entries(selectedSlots).forEach(([dateStr, slotSet]) => {
        slotSet.forEach((slotId) => {
          const config = TIME_SLOTS.find((s) => s.id === slotId);
          if (config) {
            slotsPayload.push({
              slot_date: dateStr,
              start_time: config.startTime,
              end_time: config.endTime,
            });
          }
        });
      });

      const payload: PanelistPayload = {
        name: name.trim(),
        department,
        division: currentDeptConfig.divisions.length > 0 ? division : null,
        phone_number: phone,
      };

      const res = await createPanelistWithSlots(payload, slotsPayload);
      if (res.success) {
        toast.success(`Panelist ${payload.name} created with ${slotsPayload.length} slots!`);
        setIsAddModalOpen(false);
        setShowConfirmModal(false);
        loadData();
      } else {
        toast.error(res.error || "Failed to create panelist");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSavingPanelist(false);
    }
  };

  // Delete panelist
  const handleDeletePanelist = async (panelist: any) => {
    if (!confirm(`Are you sure you want to delete panelist ${panelist.name}? This will remove all their unbooked slots.`)) {
      return;
    }

    try {
      const res = await deletePanelist(panelist.id);
      if (res.success) {
        toast.success(`Panelist ${panelist.name} removed`);
        loadData();
      } else {
        toast.error(res.error || "Failed to delete panelist");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  // Confirm cancel booking
  const handleExecuteCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const res = await adminCancelBooking(cancelModalBooking.id);
      if (res.success) {
        toast.success("Booking cancelled and slot released");
        setCancelModalBooking(null);
        loadData();
      } else {
        toast.error(res.error || "Failed to cancel booking");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Dept filter
      if (filterDept !== "ALL") {
        if (b.panelist?.department !== filterDept) return false;
      }
      // Date filter
      if (filterDate !== "ALL") {
        if (b.slot_date !== filterDate) return false;
      }
      // Search query
      if (bookingSearch.trim()) {
        const query = bookingSearch.toLowerCase();
        const candidateName = (b.booked_by_name || "").toLowerCase();
        const candidateNim = (b.booked_by_nim || "").toLowerCase();
        const candidateEmail = (b.booked_by_email || "").toLowerCase();
        const panelistName = (b.panelist?.name || "").toLowerCase();
        return (
          candidateName.includes(query) ||
          candidateNim.includes(query) ||
          candidateEmail.includes(query) ||
          panelistName.includes(query)
        );
      }
      return true;
    });
  }, [bookings, filterDept, filterDate, bookingSearch]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const headers = ["NIM", "Candidate Name", "Candidate Email", "Department", "Division", "Panelist Name", "Panelist Phone", "Date", "Time", "Booked At"];
    const rows = filteredBookings.map((b) => [
      `"${b.booked_by_nim || ""}"`,
      `"${b.booked_by_name || ""}"`,
      `"${b.booked_by_email || ""}"`,
      `"${b.panelist?.department || ""}"`,
      `"${b.panelist?.division || "-"}"`,
      `"${b.panelist?.name || ""}"`,
      `"${b.panelist?.phone_number || ""}"`,
      `"${b.slot_date}"`,
      `"${b.start_time} - ${b.end_time}"`,
      `"${b.booked_at ? new Date(b.booked_at).toLocaleString() : ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `interview_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bookings exported to CSV");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Interview Schedule Management
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-1">
            Manage panelists, set availability (17, 18, 21-24 Sept), and monitor candidate bookings.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Panelist</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("panelists")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "panelists"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Panelists & Availability</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-background/20">
            {panelists.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "bookings"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Candidate Bookings</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-background/20">
            {bookings.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Panelists & Availability */}
      {activeTab === "panelists" && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <p>Loading panelists...</p>
            </div>
          ) : panelists.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-1">No Panelists Added Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Start by adding panelists and choosing their available dates and time slots between 17 Sept – 24 Sept.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Panelist</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {panelists.map((panelist) => {
                const availableSlots = panelist.total_slots - panelist.booked_slots;
                return (
                  <div
                    key={panelist.id}
                    className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{panelist.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium text-foreground/80">{panelist.department}</span>
                            {panelist.division && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-medium">{panelist.division}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePanelist(panelist)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Panelist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 py-3 border-y border-border/60 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> WhatsApp
                          </span>
                          <a
                            href={`https://wa.me/${panelist.phone_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-primary hover:underline flex items-center gap-1"
                          >
                            +{panelist.phone_number}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Total Slots
                          </span>
                          <span className="font-semibold text-foreground">{panelist.total_slots} slots</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Booked
                          </span>
                          <span className="font-semibold text-emerald-500">
                            {panelist.booked_slots} booked
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {availableSlots > 0 ? (
                          <span className="text-primary font-medium">{availableSlots} slots open</span>
                        ) : (
                          <span className="text-amber-500 font-medium">Fully booked</span>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Added {new Date(panelist.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Candidate Bookings */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search candidate or NIM..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Filter Dept */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Filter Date */}
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Dates (17-24 Sep)</option>
                {INTERVIEW_DATES.map((d) => (
                  <option key={d.dateStr} value={d.dateStr}>
                    {d.dayLabel}, {d.formattedLabel}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors self-end sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Bookings Table / Content */}
          {loading ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <p>Loading candidate bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-1">No Bookings Found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {bookings.length === 0
                  ? "Candidates have not yet booked any interview slots."
                  : "No bookings match the selected search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Candidate</th>
                      <th className="px-5 py-3.5">Department & Division</th>
                      <th className="px-5 py-3.5">Panelist (Interviewer)</th>
                      <th className="px-5 py-3.5">Date & Time</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredBookings.map((b) => {
                      const dateObj = INTERVIEW_DATES.find((d) => d.dateStr === b.slot_date);
                      const dateDisplay = dateObj ? `${dateObj.dayLabel}, ${dateObj.formattedLabel}` : b.slot_date;
                      
                      return (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          {/* Candidate */}
                          <td className="px-5 py-4">
                            <div className="font-semibold text-foreground">{b.booked_by_name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground font-mono">NIM: {b.booked_by_nim}</div>
                            <div className="text-xs text-muted-foreground">{b.booked_by_email}</div>
                          </td>

                          {/* Dept & Division */}
                          <td className="px-5 py-4">
                            <div className="font-medium text-foreground">{b.panelist?.department || "N/A"}</div>
                            <div className="text-xs text-primary font-medium">
                              {b.panelist?.division || "General"}
                            </div>
                          </td>

                          {/* Panelist */}
                          <td className="px-5 py-4">
                            <div className="font-semibold text-foreground">{b.panelist?.name || "N/A"}</div>
                            {b.panelist?.phone_number && (
                              <a
                                href={`https://wa.me/${b.panelist.phone_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:underline font-mono mt-0.5"
                              >
                                <Phone className="w-3 h-3" />
                                +{b.panelist.phone_number}
                              </a>
                            )}
                          </td>

                          {/* Date & Time */}
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-xs mb-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{dateDisplay}</span>
                            </div>
                            <div className="text-xs text-foreground font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {b.start_time} - {b.end_time}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setCancelModalBooking(b)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors"
                            >
                              Release Slot
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD PANELIST & SLOTS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Add New Panelist</h2>
                  <p className="text-xs text-muted-foreground">
                    Assign interviewer and specify available time slots for 17 Sept – 24 Sept.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Panelist Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    WhatsApp Phone Number (Must start with 62) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, "");
                        setPhone(val);
                      }}
                      placeholder="628123456789"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Format: digits only, starting with 62 (e.g. 62812345678)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Department *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setDepartment(newDept);
                      const cfg = DEPARTMENTS.find((d) => d.name === newDept);
                      setDivision(cfg?.divisions[0] || "");
                    }}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Division {currentDeptConfig.divisions.length === 0 ? "(None)" : "*"}
                  </label>
                  {currentDeptConfig.divisions.length > 0 ? (
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                    >
                      {currentDeptConfig.divisions.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="General (No sub-division)"
                      className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              {/* Availability Grid */}
              <div className="pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Select Availability Slots</h3>
                    <p className="text-xs text-muted-foreground">
                      Click slots to toggle when this panelist is available for interviews.
                    </p>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold font-mono">
                    {totalSlotsCount} total slots selected
                  </div>
                </div>

                {/* Date Tabs (17-24 Sep) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border">
                  {INTERVIEW_DATES.map((d) => {
                    const countForDate = selectedSlots[d.dateStr]?.size || 0;
                    const isActive = currentDateTab === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => setCurrentDateTab(d.dateStr)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <span>{d.dayLabel}, {d.formattedLabel}</span>
                        {countForDate > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                              isActive ? "bg-black/20 text-white" : "bg-primary/20 text-primary"
                            }`}
                          >
                            {countForDate}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Shortcuts for Current Date */}
                <div className="flex flex-wrap items-center gap-2 my-3">
                  <span className="text-xs text-muted-foreground mr-1">Quick:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAllDay(currentDateTab)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    Select All Day (12 slots)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRange(currentDateTab, 0, 4)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    Morning (08:00 - 12:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRange(currentDateTab, 5, 9)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    Afternoon (13:00 - 17:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRange(currentDateTab, 9, 12)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    Evening (17:00 - 20:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearDay(currentDateTab)}
                    className="px-2.5 py-1 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors ml-auto"
                  >
                    Clear Day
                  </button>
                </div>

                {/* Time Slots Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlots[currentDateTab]?.has(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleToggleSlot(currentDateTab, slot.id)}
                        className={`p-3 rounded-xl text-xs font-semibold font-mono flex items-center justify-between border transition-all ${
                          isSelected
                            ? "bg-primary/20 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                        }`}
                      >
                        <span>{slot.label}</span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-border flex items-center justify-between bg-muted/20">
              <span className="text-xs text-muted-foreground font-medium">
                {totalSlotsCount === 0
                  ? "No slots selected yet"
                  : `${totalSlotsCount} slot(s) selected across 17–24 Sept`}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleValidateForm}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20"
                >
                  Review & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMATION PROMPT BEFORE SAVING */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <CalendarCheck2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-foreground mb-1">
              Confirm Panelist Availability
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-5">
              Are you sure you want to add this panelist and open these slots for candidates?
            </p>

            <div className="bg-muted/40 rounded-2xl p-4 space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Panelist:</span>
                <span className="font-semibold text-foreground">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium text-foreground">{department}</span>
              </div>
              {division && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Division:</span>
                  <span className="font-medium text-primary">{division}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-mono text-foreground">+{phone}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2">
                <span className="text-muted-foreground">Available Slots:</span>
                <span className="font-bold text-primary font-mono">{totalSlotsCount} slots</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={savingPanelist}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                disabled={savingPanelist}
                onClick={handleSavePanelist}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingPanelist ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Yes, Save</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL / RELEASE BOOKING */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-foreground mb-1">
              Release Interview Slot?
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-5">
              This will remove candidate{" "}
              <strong className="text-foreground">{cancelModalBooking.booked_by_name}</strong> from this slot.
              The slot will become available for booking again.
            </p>

            <div className="bg-muted/40 rounded-2xl p-4 space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Candidate:</span>
                <span className="font-semibold text-foreground">{cancelModalBooking.booked_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NIM:</span>
                <span className="font-mono text-foreground">{cancelModalBooking.booked_by_nim}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium text-foreground">
                  {cancelModalBooking.slot_date} ({cancelModalBooking.start_time} - {cancelModalBooking.end_time})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={cancelling}
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Dismiss
              </button>
              <button
                disabled={cancelling}
                onClick={handleExecuteCancelBooking}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-all shadow-md shadow-destructive/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Releasing...</span>
                  </>
                ) : (
                  <span>Yes, Release Slot</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
