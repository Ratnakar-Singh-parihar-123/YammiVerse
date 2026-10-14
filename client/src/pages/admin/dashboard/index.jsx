import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  TrendingUp,
  Bell,
  ChefHat,
  Calendar,
  ArrowRight,
  X,
  ExternalLink,
  User as UserIcon,
  Phone,
  MapPin,
  Flame,
  Tag,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import api, { getImageUrl } from "../../../utils/api";
import { formatDate, formatDistanceToNow } from "../../../utils/timeUtils";
import { useNotifications } from "../../../contexts/NotificationContext";

// ── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color = "primary",
  loading,
  trend,
}) => (
  <div className="flex items-start gap-4 p-5 transition-shadow border bg-card border-border rounded-xl shadow-warm hover:shadow-warm-md">
    <div className={`p-3 rounded-xl bg-${color}/10 text-${color} shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>

    <div className="flex-1 min-w-0">
      {loading ? (
        <div className="w-16 mb-1 rounded h-7 bg-muted animate-pulse" />
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold font-heading text-foreground">
            {value}
          </p>

          {trend != null && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                trend >= 0
                  ? "text-success bg-success/10"
                  : "text-destructive bg-destructive/10"
              }`}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}

      <p className="text-sm font-medium text-foreground">{label}</p>

      {sub && (
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
      )}
    </div>
  </div>
);

// ── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 animate-pulse">
    <div className="rounded-full w-9 h-9 bg-muted shrink-0" />

    <div className="flex-1 space-y-1.5">
      <div className="w-1/2 h-3 rounded bg-muted" />
      <div className="w-1/3 h-3 rounded bg-muted" />
    </div>

    <div className="w-16 h-3 rounded bg-muted" />
  </div>
);

// ── Chart Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="px-3 py-2 text-xs border rounded-lg bg-card border-border shadow-warm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-primary">
        {payload[0]?.value} {payload[0]?.name}
      </p>
    </div>
  );
};

// ── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({
  icon: Icon,
  iconColor = "text-primary",
  title,
  linkTo,
  linkLabel = "View all",
}) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      {title}
    </h3>

    {linkTo && (
      <Link
        to={linkTo}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        {linkLabel}
        <ArrowRight className="w-3 h-3" />
      </Link>
    )}
  </div>
);

// ── Modal Wrapper ────────────────────────────────────────────────────────────

const Modal = ({ children, onClose, maxWidth = "max-w-md" }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
    onClick={onClose}
  >
    <div
      className={`bg-card border border-border rounded-2xl shadow-warm-lg w-full ${maxWidth} max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

// ── Shared Information Tile ──────────────────────────────────────────────────

const InfoTile = ({ icon, label, value }) => (
  <div className="min-w-0 p-3 border rounded-xl border-border bg-muted/30">
    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>

    <p className="text-sm font-semibold truncate text-foreground">{value}</p>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="text-center">
    <p className="text-lg font-bold font-heading text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
      {label}
    </p>
  </div>
);

// ── Recipe Difficulty Badge ──────────────────────────────────────────────────

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

// ── Role Badge ───────────────────────────────────────────────────────────────

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

// ── Account Status Badge ─────────────────────────────────────────────────────

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

// ── User Detail Modal ────────────────────────────────────────────────────────

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  const avatar = user.avatar ? getImageUrl(user.avatar) : null;
  const initials = user.fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <div className="relative p-6 pb-4 border-b bg-gradient-to-br from-primary/10 to-transparent border-border">
        <button
          onClick={onClose}
          className="absolute p-2 transition-colors rounded-full top-3 right-3 text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={user.fullName || "User"}
              className="object-cover w-16 h-16 border-2 rounded-full border-card shadow-warm shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/images/no_image.png";
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-16 h-16 text-xl font-bold rounded-full bg-primary/15 text-primary shrink-0">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate font-heading text-foreground">
              {user.fullName || "Unnamed User"}
            </h2>

            <p className="text-sm truncate text-muted-foreground">
              {user.email || "No email"}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <RoleBadge role={user.role} />
              <StatusBadge verified={user.isVerified} active={user.isActive} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <InfoTile
            icon={<UserIcon className="w-3.5 h-3.5" />}
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
            value={user.createdAt ? formatDate(user.createdAt) : "—"}
          />

          <InfoTile
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Last Login"
            value={
              user.lastLogin ? formatDistanceToNow(user.lastLogin) : "Never"
            }
          />
        </div>

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

        {user.location && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Location
            </h4>

            <p className="text-sm text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {user.location}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
          <MiniStat label="Recipes" value={user.recipeCount ?? 0} />
          <MiniStat label="Followers" value={user.followersCount ?? 0} />
          <MiniStat label="Following" value={user.followingCount ?? 0} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 border-t shrink-0 border-border bg-muted/30">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Close
        </button>

        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Manage User
        </Link>
      </div>
    </Modal>
  );
};

// ── Recipe Detail Modal ──────────────────────────────────────────────────────

const RecipeDetailModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  const img = recipe.coverImage ? getImageUrl(recipe.coverImage) : null;

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="relative h-52 sm:h-60 bg-muted shrink-0">
        {img ? (
          <img
            src={img}
            alt={recipe.title || "Recipe"}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/assets/images/no_image.png";
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ChefHat className="w-14 h-14 text-muted-foreground/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        <button
          onClick={onClose}
          className="absolute p-2 text-white transition-colors rounded-full top-3 right-3 bg-black/40 backdrop-blur-sm hover:bg-black/60"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

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
            {recipe.title || "Untitled Recipe"}
          </h2>

          {recipe.description && (
            <p className="mt-1 text-sm text-white/85 line-clamp-2">
              {recipe.description}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoTile
            icon={<UserIcon className="w-3.5 h-3.5" />}
            label="Author"
            value={recipe.createdBy?.fullName || "Unknown"}
          />

          <InfoTile
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Cook Time"
            value={
              recipe.cookTime
                ? `${recipe.cookTime} min`
                : recipe.totalTime
                  ? `${recipe.totalTime} min`
                  : "—"
            }
          />

          <InfoTile
            icon={<Users className="w-3.5 h-3.5" />}
            label="Servings"
            value={recipe.servings || "—"}
          />

          <InfoTile
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Created"
            value={recipe.createdAt ? formatDate(recipe.createdAt) : "—"}
          />
        </div>

        {recipe.ingredients?.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 mb-2 text-sm font-bold font-heading text-foreground">
              <Flame className="w-4 h-4 text-primary" />
              Ingredients
            </h4>

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
                      : `${ing.quantity || ""} ${ing.unit || ""} ${ing.name || ""}`.trim()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.steps?.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 mb-2 text-sm font-bold font-heading text-foreground">
              <Tag className="w-4 h-4 text-primary" />
              Instructions
            </h4>

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
          </div>
        )}

        {recipe.tags?.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-bold font-heading text-foreground">
              Tags
            </h4>

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
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 p-4 border-t shrink-0 border-border bg-muted/30">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Close
        </button>

        <Link
          to={`/recipes/${recipe._id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Full Recipe
        </Link>
      </div>
    </Modal>
  );
};

// ── Admin Dashboard ──────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { unreadCount } = useNotifications();

  const [userDetail, setUserDetail] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/admin/dashboard")
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load dashboard");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Close modals using Escape key.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setUserDetail(null);
        setRecipeDetail(null);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stats = data?.stats || {};
  const recentUsers = data?.recentUsers || [];
  const recentRecipes = data?.recentRecipes || [];
  const userGrowth = data?.userGrowth || [];
  const recipeGrowth = data?.recipeGrowth || [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-destructive">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Main Stats ── */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers ?? "—"}
          sub={`+${stats.newUsersLast30 ?? 0} this month`}
          color="primary"
          loading={loading}
        />

        <StatCard
          icon={BookOpen}
          label="Total Recipes"
          value={stats.totalRecipes ?? "—"}
          sub={`+${stats.newRecipesLast30 ?? 0} this month`}
          color="success"
          loading={loading}
        />

        <StatCard
          icon={TrendingUp}
          label="New Recipes (30d)"
          value={stats.newRecipesLast30 ?? "—"}
          sub="Last 30 days"
          color="accent"
          loading={loading}
        />

        <StatCard
          icon={Bell}
          label="Unread Alerts"
          value={unreadCount ?? 0}
          sub="Admin notifications"
          color="destructive"
          loading={loading}
        />
      </div>

      {/* ── User and Recipe Growth Charts ── */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* User Growth */}

        <div className="p-5 border bg-card border-border rounded-xl shadow-warm">
          <SectionHeader
            icon={Users}
            iconColor="text-primary"
            title="User Registrations — Last 7 Days"
          />

          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={userGrowth}
                margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />

                <XAxis
                  dataKey="_id"
                  tick={{
                    fontSize: 10,
                    fill: "var(--color-muted-foreground)",
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "var(--color-muted-foreground)",
                  }}
                  allowDecimals={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="count"
                  name="users"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center text-sm h-44 text-muted-foreground">
              {loading ? (
                <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin" />
              ) : (
                "No user growth data yet"
              )}
            </div>
          )}
        </div>

        {/* Recipe Growth */}

        <div className="p-5 border bg-card border-border rounded-xl shadow-warm">
          <SectionHeader
            icon={ChefHat}
            iconColor="text-success"
            title="Recipes Added — Last 7 Days"
          />

          {recipeGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={recipeGrowth}
                margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />

                <XAxis
                  dataKey="_id"
                  tick={{
                    fontSize: 10,
                    fill: "var(--color-muted-foreground)",
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "var(--color-muted-foreground)",
                  }}
                  allowDecimals={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="count"
                  name="recipes"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-success)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center text-sm h-44 text-muted-foreground">
              {loading ? (
                <div className="w-8 h-8 border-4 rounded-full border-success border-t-transparent animate-spin" />
              ) : (
                "No recipe growth data yet"
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Users and Recipes ── */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Users */}

        <div className="p-5 border bg-card border-border rounded-xl shadow-warm">
          <SectionHeader
            icon={Users}
            iconColor="text-primary"
            title="Recent Users"
            linkTo="/admin/users"
          />

          <div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recentUsers.length === 0 ? (
              <div className="py-8 text-sm text-center text-muted-foreground">
                No users yet
              </div>
            ) : (
              recentUsers.map((user) => {
                const initials = user.fullName?.charAt(0)?.toUpperCase() || "?";

                const avatar = user.avatar ? getImageUrl(user.avatar) : null;

                return (
                  <button
                    key={user._id}
                    onClick={() => setUserDetail(user)}
                    className="w-full flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded-lg px-2 transition-colors text-left"
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={user.fullName || "User"}
                        className="object-cover border rounded-full w-9 h-9 border-border shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/images/no_image.png";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center text-sm font-bold rounded-full w-9 h-9 bg-primary/15 text-primary shrink-0">
                        {initials}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {user.fullName || "Unnamed User"}
                      </p>

                      <p className="text-xs truncate text-muted-foreground">
                        {user.email || "No email"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Calendar className="w-3 h-3" />
                      {user.createdAt ? formatDate(user.createdAt) : "—"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Recipes */}

        <div className="p-5 border bg-card border-border rounded-xl shadow-warm">
          <SectionHeader
            icon={BookOpen}
            iconColor="text-success"
            title="Recent Recipes"
            linkTo="/admin/recipes"
          />

          <div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recentRecipes.length === 0 ? (
              <div className="py-8 text-sm text-center text-muted-foreground">
                No recipes yet
              </div>
            ) : (
              recentRecipes.map((recipe) => {
                const img = recipe.coverImage
                  ? getImageUrl(recipe.coverImage)
                  : null;

                return (
                  <button
                    key={recipe._id}
                    onClick={() => setRecipeDetail(recipe)}
                    className="w-full flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded-lg px-2 transition-colors text-left"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={recipe.title || "Recipe"}
                        className="object-cover border rounded-lg w-9 h-9 border-border shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/images/no_image.png";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-muted shrink-0">
                        <ChefHat className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {recipe.title || "Untitled Recipe"}
                      </p>

                      <p className="text-xs truncate text-muted-foreground">
                        by {recipe.createdBy?.fullName || "Unknown"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Calendar className="w-3 h-3" />
                      {recipe.createdAt ? formatDate(recipe.createdAt) : "—"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Modals ── */}

      {userDetail && (
        <UserDetailModal
          user={userDetail}
          onClose={() => setUserDetail(null)}
        />
      )}

      {recipeDetail && (
        <RecipeDetailModal
          recipe={recipeDetail}
          onClose={() => setRecipeDetail(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
