import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
  User,
  Settings,
  LogOut,
  ChefHat,
  X,
} from "lucide-react";
import { useNotifications } from "../../../contexts/NotificationContext";
import { clearAuthSession } from "../../../utils/auth";

const navSections = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Content",
    items: [{ to: "/admin/recipes", label: "Recipes", icon: BookOpen }],
  },
  {
    label: "People",
    items: [{ to: "/admin/users", label: "Users", icon: Users }],
  },
  {
    label: "Communication",
    items: [
      {
        to: "/admin/notifications",
        label: "Notifications",
        icon: Bell,
        badge: true,
      },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/admin/profile", label: "My Profile", icon: User }],
  },
];

const AdminSidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const handleLogout = () => {
    clearAuthSession();
    if (onClose) onClose();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex flex-col w-64 h-full border-r bg-card border-border shrink-0">
      {/* Logo header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Link
          to="/admin"
          className="flex items-center gap-2.5"
          onClick={onClose}
        >
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-primary to-primary/70 text-primary-foreground shadow-sm">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="block text-sm font-bold font-heading text-foreground">
              YammiVerse
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </span>
          </div>
        </Link>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 px-2">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to, item.exact);
                const showBadge = item.badge && unreadCount > 0;

                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {showBadge && (
                        <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-0.5">
        <Link
          to="/home"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChefHat className="w-4 h-4 shrink-0" />
          <span>Back to Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
