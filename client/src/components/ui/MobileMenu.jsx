import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { LogOut, LogIn } from "lucide-react";

const MobileMenu = ({
  isOpen,
  onClose,
  navigationItems,
  currentUser,
  onLogin,
  onLogout,
  isActivePath,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Menu with Slide Animation */}
      <div
        className="absolute top-0 left-0 w-3/4 max-w-xs h-full bg-background shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-heading font-bold text-foreground">Menu</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 text-foreground transition"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActivePath(item.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30 hover:shadow-sm"
                }`}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-5">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Theme
            </span>
            <ThemeToggle />
          </div>

          {/* Login / Logout */}
          {currentUser ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 transition"
            >
              <LogOut className="h-5 w-5" /> Logout
            </button>
          ) : (
            <button
              onClick={() => {
                onLogin();
                onClose();
              }}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-base font-medium text-primary hover:bg-primary/10 transition"
            >
              <LogIn className="h-5 w-5" /> Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
