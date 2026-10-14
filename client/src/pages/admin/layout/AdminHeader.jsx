import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ChefHat,
  Check,
} from "lucide-react";
import { useNotifications } from "../../../contexts/NotificationContext";
import {
  getAuthUser,
  clearAuthSession,
  getAuthToken,
} from "../../../utils/auth";
import { getImageUrl } from "../../../utils/api";
import api from "../../../utils/api";
import { formatDistanceToNow } from "../../../utils/timeUtils";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/users": "User Management",
  "/admin/recipes": "Recipe Management",
  "/admin/notifications": "Notifications",
  "/admin/profile": "Admin Profile",
};

const AdminHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead } =
    useNotifications();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const pageTitle = pageTitles[location.pathname] || "Admin";

  useEffect(() => {
    const load = () => {
      const u = getAuthUser();
      setAdminUser(u);
    };
    load();
    window.addEventListener("auth-change", load);
    return () => window.removeEventListener("auth-change", load);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const userName =
    adminUser?.fullName || adminUser?.email?.split("@")[0] || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarUrl = adminUser?.avatar ? getImageUrl(adminUser.avatar) : null;
  const recentNotifs = notifications.slice(0, 6);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-16 bg-card border-b border-border shadow-sm">
      {/* Left: Mobile hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-heading font-bold text-foreground leading-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Notifications + User menu */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown((prev) => !prev)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={`${unreadCount} unread notifications`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-0.5 text-[9px] font-bold rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-warm-lg z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {recentNotifs.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No notifications yet
                  </div>
                ) : (
                  recentNotifs.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n._id);
                        setShowNotifDropdown(false);
                        if (n.link) navigate(n.link);
                      }}
                      className={`flex gap-3 px-4 py-3 cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50 ${
                        !n.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? "bg-primary" : "bg-transparent"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border">
                <Link
                  to="/admin/notifications"
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-border/70 hover:bg-muted transition-colors"
            aria-expanded={showUserMenu}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-7 h-7 rounded-full object-cover border border-border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/images/no_image.png";
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                {userInitial}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
              {userName.split(" ")[0]}
            </span>
            <ChevronDown
              className={`hidden sm:block w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""}`}
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card shadow-warm-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-border/70">
                <p className="text-sm font-semibold text-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {adminUser?.email}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Administrator
                </span>
              </div>
              <div className="py-1">
                <Link
                  to="/admin/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  My Profile
                </Link>
                <Link
                  to="/home"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <ChefHat className="w-4 h-4 text-muted-foreground" />
                  View Site
                </Link>
              </div>
              <div className="pt-1 border-t border-border/70">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
