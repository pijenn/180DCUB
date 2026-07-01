"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    judul: "",
    jenis_artikel: "CASE STUDY",
    link_instagram: "",
    foto: "",
  });

  const supabase = createClient();

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOpenModal = (article: any = null) => {
    if (article) {
      setFormData({
        id: article.id,
        judul: article.judul,
        jenis_artikel: article.jenis_artikel,
        link_instagram: article.link_instagram,
        foto: article.foto || "",
      });
    } else {
      setFormData({
        id: "",
        judul: "",
        jenis_artikel: "CASE STUDY",
        link_instagram: "",
        foto: "",
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

    const { error } = await supabase.from("articles").upsert(payload);

    if (!error) {
      setIsModalOpen(false);
      fetchArticles();
      toast.success("Article saved successfully!");
    } else {
      toast.error("Failed to save article: " + error.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (!error) {
        fetchArticles();
        toast.success("Article deleted successfully!");
      } else {
        toast.error("Failed to delete article: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">Manage Knowledge & Research content.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Article</span>
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
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Instagram</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No articles found.
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        {article.foto ? (
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted relative">
                            <Image 
                              src={article.foto} 
                              alt={article.judul} 
                              fill 
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {article.judul}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {article.jenis_artikel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={article.link_instagram} 
                          target="_blank"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleOpenModal(article)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
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
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">{formData.id ? "Edit Article" : "Add New Article"}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  required
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  placeholder="e.g. Optimizing Non-Profit Operations"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Article Type</label>
                <input
                  required
                  type="text"
                  value={formData.jenis_artikel}
                  onChange={(e) => setFormData({ ...formData, jenis_artikel: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent uppercase"
                  placeholder="e.g. CASE STUDY, ANALYSIS"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Instagram Link</label>
                <input
                  required
                  type="url"
                  value={formData.link_instagram}
                  onChange={(e) => setFormData({ ...formData, link_instagram: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  placeholder="https://instagram.com/p/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.foto}
                  onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">Provide a direct link to the image to display on the cards.</p>
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
                  <span>Save Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
