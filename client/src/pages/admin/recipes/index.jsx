import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Clock,
  Users,
  Flame,
  Tag,
  Calendar,
  User as UserIcon,
  ExternalLink,
} from "lucide-react";
import api, { getImageUrl } from "../../../utils/api";
import { formatDate } from "../../../utils/timeUtils";

// ── Row skeleton ──────────────────────────────────────────────────────────────
const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-40 bg-muted rounded" />
          <div className="w-24 h-3 rounded bg-muted" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="w-24 h-3 rounded bg-muted" />
    </td>
    <td className="px-4 py-3">
      <div className="w-16 h-3 rounded bg-muted" />
    </td>
    <td className="px-4 py-3">
      <div className="h-5 rounded-full w-14 bg-muted" />
    </td>
    <td className="px-4 py-3">
      <div className="w-20 h-3 rounded bg-muted" />
    </td>
    <td className="px-4 py-3">
      <div className="w-16 h-8 ml-auto rounded-lg bg-muted" />
    </td>
  </tr>
);

// ── Difficulty badge ──────────────────────────────────────────────────────────
const DiffBadge = ({ diff }) => {
  const colors = {
    easy: "text-success bg-success/10 border-success/20",
    medium: "text-warning bg-warning/10 border-warning/20",
    hard: "text-destructive bg-destructive/10 border-destructive/20",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
        colors[diff] || "text-muted-foreground bg-muted border-border"
      }`}
    >
      {diff || "—"}
    </span>
  );
};

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
const ConfirmDeleteModal = ({ recipe, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
    <div className="w-full max-w-sm border bg-card border-border rounded-2xl shadow-warm-lg animate-scaleIn">
      <div className="p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-foreground">
          Delete Recipe
        </h3>
        <p className="mb-5 text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">
            "{recipe?.title}"
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Recipe Detail Modal ───────────────────────────────────────────────────────
const RecipeDetailModal = ({ recipe, onClose, onDelete }) => {
  if (!recipe) return null;
  const img = recipe.coverImage ? getImageUrl(recipe.coverImage) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-warm-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-56 sm:h-64 bg-muted shrink-0">
          {img ? (
            <img
              src={img}
              alt={recipe.title}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/images/no_image.png";
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <ChefHat className="w-14 h-14 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute p-2 text-white transition-colors rounded-full top-3 right-3 bg-black/40 backdrop-blur-sm hover:bg-black/60"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <DiffBadge diff={recipe.difficulty} />
              {recipe.category && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
                  #{recipe.category}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold leading-tight sm:text-2xl font-heading drop-shadow">
              {recipe.title}
            </h2>
            {recipe.description && (
              <p className="mt-1 text-sm text-white/85 line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Meta stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox
              icon={<UserIcon className="w-4 h-4" />}
              label="Author"
              value={recipe.createdBy?.fullName || "Unknown"}
            />
            <StatBox
              icon={<Clock className="w-4 h-4" />}
              label="Cook Time"
              value={
                recipe.cookTime
                  ? `${recipe.cookTime} min`
                  : recipe.totalTime
                    ? `${recipe.totalTime} min`
                    : "—"
              }
            />
            <StatBox
              icon={<Users className="w-4 h-4" />}
              label="Servings"
              value={recipe.servings || "—"}
            />
            <StatBox
              icon={<Calendar className="w-4 h-4" />}
              label="Created"
              value={formatDate(recipe.createdAt)}
            />
          </div>

          {/* Ingredients */}
          {recipe.ingredients?.length > 0 && (
            <Section title="Ingredients" icon={<Flame className="w-4 h-4" />}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      {typeof ing === "string"
                        ? ing
                        : `${ing.quantity || ""} ${ing.unit || ""} ${
                            ing.name || ""
                          }`.trim()}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Steps */}
          {recipe.steps?.length > 0 && (
            <Section title="Instructions" icon={<Tag className="w-4 h-4" />}>
              <ol className="space-y-3">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full shrink-0 bg-primary/10 text-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed pt-0.5">
                      {typeof step === "string"
                        ? step
                        : step.text || step.description || ""}
                    </p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Tags */}
          {recipe.tags?.length > 0 && (
            <Section title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 p-4 border-t shrink-0 border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
          <div className="flex gap-2">
            <Link
              to={`/recipes/${recipe._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Full
            </Link>
            <button
              onClick={() => onDelete(recipe)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Small building blocks ─────────────────────────────────────────────────────
const StatBox = ({ icon, label, value }) => (
  <div className="p-3 border rounded-xl border-border bg-muted/30">
    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
    <p className="text-sm font-semibold truncate text-foreground">{value}</p>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div>
    <h4 className="flex items-center gap-2 mb-2 text-sm font-bold font-heading text-foreground">
      {icon}
      {title}
    </h4>
    {children}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await api.get(`/api/admin/recipes?${params}`);
      setRecipes(res.data.recipes || []);
      setPagination(res.data.pagination || { total: 0, pages: 1, page: 1 });
    } catch (err) {
      console.error("fetchRecipes error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Close modals on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setDetailTarget(null);
        if (!deleting) setDeleteTarget(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleting]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/recipes/${deleteTarget._id}`);
      setRecipes((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      setToast(`"${deleteTarget.title}" deleted successfully.`);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setToast(
        "Delete failed: " + (err.response?.data?.message || err.message),
      );
      setTimeout(() => setToast(""), 4000);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] bg-foreground text-background text-sm font-medium px-4 py-3 rounded-xl shadow-warm-lg animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Header + Search */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold font-heading text-foreground">
            Recipes
          </h2>
          <p className="text-sm text-muted-foreground">
            {pagination.total} total recipes
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 pr-3 text-sm border rounded-lg pl-9 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden border bg-card border-border rounded-xl shadow-warm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Recipe
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Author
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Difficulty
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-right uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <ChefHat className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No recipes found
                    </p>
                  </td>
                </tr>
              ) : (
                recipes.map((r) => {
                  const img = r.coverImage ? getImageUrl(r.coverImage) : null;
                  return (
                    <tr
                      key={r._id}
                      onClick={() => setDetailTarget(r)}
                      className="transition-colors cursor-pointer hover:bg-muted/40 group"
                    >
                      {/* Recipe cell */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-12 h-12 overflow-hidden border rounded-lg bg-muted shrink-0 border-border">
                            {img ? (
                              <img
                                src={img}
                                alt={r.title}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/assets/images/no_image.png";
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full">
                                <ChefHat className="w-5 h-5 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate max-w-[220px]">
                              {r.title}
                            </p>
                            {r.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                {r.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-3">
                        <p className="text-foreground truncate max-w-[140px]">
                          {r.createdBy?.fullName || "Unknown"}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        {r.category ? (
                          <span className="text-xs text-muted-foreground">
                            #{r.category}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      {/* Difficulty */}
                      <td className="px-4 py-3">
                        <DiffBadge diff={r.difficulty} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(r.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setDetailTarget(r)}
                            className="p-2 transition-colors rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="p-2 transition-colors rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete recipe"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 transition-colors border rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="p-2 transition-colors border rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailTarget && (
        <RecipeDetailModal
          recipe={detailTarget}
          onClose={() => setDetailTarget(null)}
          onDelete={(r) => {
            setDetailTarget(null);
            setDeleteTarget(r);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          recipe={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default AdminRecipesPage;
