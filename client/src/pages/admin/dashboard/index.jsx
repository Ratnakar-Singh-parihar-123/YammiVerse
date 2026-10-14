/**
 * Admin Dashboard — index.jsx
 *
 * Real stats from the database:
 * - Total users, total recipes, new users in 30 days, new recipes in 30 days
 * - 7-day growth charts (LineChart via recharts)
 * - Recent users and recent recipes
 * - Unread notifications summary
 */
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color = "primary",
  loading,
}) => (
  <div className="flex items-start gap-4 p-5 border bg-card border-border rounded-xl shadow-warm">
    <div className={`p-3 rounded-xl bg-${color}/10 text-${color} shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      {loading ? (
        <div className="w-16 mb-1 rounded h-7 bg-muted animate-pulse" />
      ) : (
        <p className="text-2xl font-bold font-heading text-foreground">
          {value}
        </p>
      )}
      <p className="text-sm font-medium text-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Skeleton row ──────────────────────────────────────────────────────────────
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

// ── Mini chart tooltip ────────────────────────────────────────────────────────
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

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { unreadCount } = useNotifications();

  useEffect(() => {
    api
      .get("/api/admin/dashboard")
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const recentUsers = data?.recentUsers || [];
  const recentRecipes = data?.recentRecipes || [];
  const userGrowth = data?.userGrowth || [];
  const recipeGrowth = data?.recipeGrowth || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stat cards ── */}
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
          value={unreadCount}
          sub="Admin notifications"
          color="destructive"
          loading={loading}
        />
      </div>

      {/* ── Growth charts ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* User growth */}
        <div className="p-5 border bg-card border-border rounded-xl shadow-warm">
          <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
            <Users className="w-4 h-4 text-primary" />
            User Registrations — Last 7 Days
          </h3>
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
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
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
                "No data yet"
              )}
            </div>
          )}
        </div>

        {/* Recipe growth */}
        <div className="p-5 border bg-card border-border rounded-xl shadow-warm">
          <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
            <ChefHat className="w-4 h-4 text-success" />
            Recipes Added — Last 7 Days
          </h3>
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
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
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
                "No data yet"
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent lists ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent users */}
        <div className="p-5 border bg-card border-border rounded-xl shadow-warm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="w-4 h-4 text-primary" />
              Recent Users
            </h3>
            <Link
              to="/admin/users"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recentUsers.length === 0 ? (
              <div className="py-8 text-sm text-center text-muted-foreground">
                No users yet
              </div>
            ) : (
              recentUsers.map((u) => {
                const initials = u.fullName?.charAt(0)?.toUpperCase() || "?";
                const avatar = u.avatar ? getImageUrl(u.avatar) : null;
                return (
                  <Link
                    key={u._id}
                    to={`/admin/users`}
                    className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded-lg px-1 transition-colors"
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={u.fullName}
                        className="object-cover border rounded-full w-9 h-9 border-border shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/images/no_image.png";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center text-sm font-bold rounded-full w-9 h-9 bg-primary/15 text-primary shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {u.fullName}
                      </p>
                      <p className="text-xs truncate text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatDate(u.createdAt)}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Recent recipes */}
        <div className="p-5 border bg-card border-border rounded-xl shadow-warm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="w-4 h-4 text-success" />
              Recent Recipes
            </h3>
            <Link
              to="/admin/recipes"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recentRecipes.length === 0 ? (
              <div className="py-8 text-sm text-center text-muted-foreground">
                No recipes yet
              </div>
            ) : (
              recentRecipes.map((r) => {
                const img = r.coverImage ? getImageUrl(r.coverImage) : null;
                return (
                  <Link
                    key={r._id}
                    to={`/recipes/${r._id}`}
                    className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded-lg px-1 transition-colors"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={r.title}
                        className="object-cover border rounded-lg w-9 h-9 border-border shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/images/no_image.png";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-muted shrink-0">
                        <ChefHat className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {r.title}
                      </p>
                      <p className="text-xs truncate text-muted-foreground">
                        by {r.createdBy?.fullName || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatDate(r.createdAt)}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
