"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Loader2, Calendar } from "lucide-react";

export default function MentoringAdmin() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [mentoringProducts, setMentoringProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    product_id: "",
    start_time: "",
    end_time: "",
    is_booked: false,
  });

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch products that are MENTORING to populate the dropdown
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .eq("type", "MENTORING");
      
    if (products) setMentoringProducts(products);

    // Fetch schedules with joined product names
    const { data: scheds, error } = await supabase
      .from("mentoring_schedules")
      .select(`
        *,
        products (
          name
        )
      `)
      .order("start_time", { ascending: true });

    if (!error && scheds) {
      setSchedules(scheds);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (schedule: any = null) => {
    if (schedule) {
      // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
      const start = new Date(schedule.start_time);
      const end = new Date(schedule.end_time);
      
      const formatLocal = (d: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setFormData({
        id: schedule.id,
        product_id: schedule.product_id,
        start_time: formatLocal(start),
        end_time: formatLocal(end),
        is_booked: schedule.is_booked,
      });
    } else {
      setFormData({
        id: "",
        product_id: mentoringProducts.length > 0 ? mentoringProducts[0].id : "",
        start_time: "",
        end_time: "",
        is_booked: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!formData.product_id) {
      alert("Please select a mentoring product.");
      setIsSaving(false);
      return;
    }

    const payload = {
      product_id: formData.product_id,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
      is_booked: formData.is_booked,
    };

    let error;
    if (formData.id) {
      const { error: updateError } = await supabase
        .from("mentoring_schedules")
        .update(payload)
        .eq("id", formData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("mentoring_schedules")
        .insert([payload]);
      error = insertError;
    }

    if (!error) {
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Failed to save schedule: " + error.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this schedule slot?")) {
      const { error } = await supabase.from("mentoring_schedules").delete().eq("id", id);
      if (!error) {
        fetchData();
      } else {
        alert("Failed to delete schedule: " + error.message);
      }
    }
  };

  const formatDisplayDate = (isoString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentoring Schedules</h1>
          <p className="text-muted-foreground">Manage available time slots for your mentoring sessions.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Slot</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Mentoring Package</th>
                  <th className="px-6 py-4 font-medium">Start Time</th>
                  <th className="px-6 py-4 font-medium">End Time</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No schedule slots found.
                    </td>
                  </tr>
                ) : (
                  schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {schedule.products?.name || "Unknown Product"}
                      </td>
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDisplayDate(schedule.start_time)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {formatDisplayDate(schedule.end_time)}
                      </td>
                      <td className="px-6 py-4">
                        {schedule.is_booked ? (
                          <span className="bg-destructive/10 text-destructive text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            Booked
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleOpenModal(schedule)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">{formData.id ? "Edit Schedule Slot" : "Add Schedule Slot"}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mentoring Product</label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                >
                  {mentoringProducts.length === 0 && (
                    <option value="" disabled>No mentoring products found!</option>
                  )}
                  {mentoringProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <input
                  required
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <input
                  required
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                />
              </div>

              {formData.id && (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    id="is_booked"
                    type="checkbox"
                    checked={formData.is_booked}
                    onChange={(e) => setFormData({ ...formData, is_booked: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_booked" className="text-sm font-medium">
                    Mark as Booked
                  </label>
                </div>
              )}

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
                  disabled={isSaving || mentoringProducts.length === 0}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
