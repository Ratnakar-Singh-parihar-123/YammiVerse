import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  X,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  MapPin,
  Globe,
  BookOpen,
  Users as UsersIcon,
  UserPlus,
  Phone,
  ExternalLink,
  Eye,
} from "lucide-react";
import api, { getImageUrl } from "../../../utils/api";
import { formatDate, formatDistanceToNow } from "../../../utils/timeUtils";

// ── Table skeleton ────────────────────────────────────────────────────────────
const TableSkeleton = () =>
  Array.from({ length: 8 }).map((_, i) => (
    <tr key={i} className="border-b border-border/50 animate-pulse">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
          <div className="space-y-1.5">
            <div className="w-32 h-3 rounded bg-muted" />
            <div className="w-40 h-3 rounded bg-muted" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="w-16 h-5 rounded-full bg-muted" />
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <div className="w-24 h-3 rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="w-12 h-3 ml-auto rounded bg-muted" />
      </td>
    </tr>
  ));

// ── Badges ────────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    admin: "text-destructive bg-destructive/10 border-destructive/20",
    moderator: "text-warning bg-warning/10 border-warning/20",
    user: "text-primary bg-primary/10 border-primary/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
        map[role] || map.user
      }`}
    >
      <Shield className="w-3 h-3" />
      {role || "user"}
    </span>
  );
};

const StatusBadge = ({ verified, active }) => {
  if (active === false) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border text-destructive bg-destructive/10 border-destructive/20">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    );
  }
  if (verified === false) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border text-warning bg-warning/10 border-warning/20">
        <Clock className="w-3 h-3" />
        Unverified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border text-success bg-success/10 border-success/20">
      <CheckCircle2 className="w-3 h-3" />
      Verified
    </span>
  );
};

// ── Small tiles ───────────────────────────────────────────────────────────────
const InfoTile = ({ icon, label, value, href }) => (
  <div className="min-w-0 p-3 border rounded-xl border-border bg-muted/30">
    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
    {href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm font-semibold truncate text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value}
      </a>
    ) : (
      <p className="text-sm font-semibold truncate text-foreground">{value}</p>
    )}
  </div>
);

const MiniStat = ({ label, value, icon: Icon }) => (
  <div className="py-3 text-center border rounded-xl border-border bg-muted/20">
    {Icon && <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />}
    <p className="text-lg font-bold font-heading text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
      {label}
    </p>
  </div>
);

// ── User Detail Modal ─────────────────────────────────────────────────────────
const UserDetailModal = ({ user, onClose, loading }) => {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const avatar = user?.avatar ? getImageUrl(user.avatar) : null;
  const initials = user?.fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-warm-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-5 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-border shrink-0">
          <button
            onClick={onClose}
            className="absolute p-2 transition-colors rounded-full top-3 right-3 text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {loading ? (
            <div className="flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-40 h-4 rounded bg-muted" />
                <div className="h-3 rounded bg-muted w-52" />
                <div className="w-24 h-5 rounded-full bg-muted" />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.fullName}
                  className="object-cover w-16 h-16 border-2 rounded-full border-card shadow-warm shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/images/no_image.png";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 text-xl font-bold border-2 rounded-full bg-primary/15 text-primary shrink-0 border-card shadow-warm">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate font-heading text-foreground">
                  {user.fullName || "Unnamed User"}
                </h2>
                <p className="text-sm truncate text-muted-foreground">
                  {user.email}
                </p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <RoleBadge role={user.role} />
                  <StatusBadge
                    verified={user.isVerified}
                    active={user.isActive}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoTile
                  icon={<User className="w-3.5 h-3.5" />}
                  label="Username"
                  value={user.username || "—"}
                />
                <InfoTile
                  icon={<Phone className="w-3.5 h-3.5" />}
                  label="Phone"
                  value={user.phone || "—"}
                />
                <InfoTile
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Joined"
                  value={formatDate(user.createdAt)}
                />
                <InfoTile
                  icon={<Clock className="w-3.5 h-3.5" />}
                  label="Last Login"
                  value={
                    user.lastLogin
                      ? formatDistanceToNow(user.lastLogin)
                      : "Never"
                  }
                />
                {user.location && (
                  <InfoTile
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="Location"
                    value={user.location}
                  />
                )}
                {user.website && (
                  <InfoTile
                    icon={<Globe className="w-3.5 h-3.5" />}
                    label="Website"
                    value={user.website.replace(/^https?:\/\//, "")}
                    href={user.website}
                  />
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Bio
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="pt-2 border-t border-border">
                <h4 className="mb-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Activity
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat
                    icon={BookOpen}
                    label="Recipes"
                    value={user.recipeCount ?? 0}
                  />
                  <MiniStat
                    icon={UsersIcon}
                    label="Followers"
                    value={user.followersCount ?? 0}
                  />
                  <MiniStat
                    icon={UserPlus}
                    label="Following"
                    value={user.followingCount ?? 0}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t shrink-0 border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
          <Link
            to="/admin/users"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Manage User
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await api.get(`/api/admin/users?${params}`);
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || { total: 0, pages: 1, page: 1 });
    } catch (err) {
      console.error("fetchUsers error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open detail modal — instant open with partial data, then fetch full detail
  const openUserDetail = async (u) => {
    setSelectedUserId(u._id);
    setSelectedUser(u); // show list data immediately
    setLoadingDetail(true);
    try {
      const res = await api.get(`/api/admin/users/${u._id}`);
      // Only update if user hasn't closed the modal in the meantime
      setSelectedUser((prev) =>
        prev && prev._id === u._id ? res.data.user : prev,
      );
    } catch (err) {
      console.error("openUserDetail error:", err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeUserDetail = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
    setLoadingDetail(false);
  };

  return (
    <div className="space-y-5">
      {/* Header + Search */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold font-heading text-foreground">
            Users
          </h2>
          <p className="text-sm text-muted-foreground">
            {pagination.total} total users
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 text-sm border rounded-lg pl-9 pr-9 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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

      {/* Table */}
      <div className="overflow-hidden border bg-card border-border rounded-xl shadow-warm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                  Role
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground sm:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-right uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <TableSkeleton />
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const avatar = u.avatar ? getImageUrl(u.avatar) : null;
                  const initials = u.fullName?.charAt(0)?.toUpperCase() || "?";
                  return (
                    <tr
                      key={u._id}
                      onClick={() => openUserDetail(u)}
                      className="transition-colors cursor-pointer hover:bg-muted/40 group"
                    >
                      {/* User cell */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={u.fullName}
                              className="object-cover w-10 h-10 border rounded-full border-border shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/images/no_image.png";
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 text-sm font-bold rounded-full bg-primary/15 text-primary shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[180px]">
                              {u.fullName || "Unnamed"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <RoleBadge role={u.role} />
                          {u.isVerified === false && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border text-warning bg-warning/10 border-warning/20">
                              <Clock className="w-3 h-3" />
                              Unverified
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(u.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openUserDetail(u)}
                            className="p-2 transition-colors rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openUserDetail(u)}
                            className="hidden px-2 text-xs font-medium sm:inline-flex text-primary hover:underline"
                          >
                            View
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

      {/* User Detail Modal */}
      {selectedUserId && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          loading={loadingDetail}
          onClose={closeUserDetail}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
