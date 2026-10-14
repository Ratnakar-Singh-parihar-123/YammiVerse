import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Heart,
  Plus,
  ChefHat,
  LogOut,
  Search,
  Info,
  User,
  ChevronDown,
  LayoutDashboard,
  Users,
  BookOpen,
  ShieldCheck,
  Bell,
} from "lucide-react";

import Button from "./Button";
import NavigationLogo from "./NavigationLogo";
import ThemeToggle from "./ThemeToggle";
import { getAuthUser } from "../../utils/auth";
import { getImageUrl } from "../../utils/api";
import { useUserNotifications } from "../../contexts/UserNotificationContext";

const TopNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const {
    unreadCount: userNotifCount,
    notifications: userNotifications,
    markAsRead: markUserNotifAsRead,
    markAllRead: markAllUserRead,
  } = useUserNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load authenticated user and listen for authentication changes.
  useEffect(() => {
    const loadUser = () => {
      setCurrentUser(getAuthUser());
    };

    loadUser();

    window.addEventListener("auth-change", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  // Close menus whenever the route changes.
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  // Close the user dropdown or notification dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menus using Escape.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
        setIsNotifOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isAdmin = currentUser?.role === "admin";

  const userNavigationItems = [
    { path: "/home", label: "Explore", icon: ChefHat },
    { path: "/favorites", label: "Favorites", icon: Heart },
    { path: "/add-recipe", label: "Add Recipe", icon: Plus },
    { path: "/about", label: "About", icon: Info },
  ];

  const adminNavigationItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      path: "/admin/users",
      label: "Manage Users",
      icon: Users,
    },
    {
      path: "/admin/recipes",
      label: "Manage Recipes",
      icon: BookOpen,
    },
  ];

  // Admins see admin navigation and user navigation.
  // Normal users see only user navigation.
  const navigationItems = isAdmin
    ? [...adminNavigationItems, ...userNavigationItems]
    : userNavigationItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((previous) => !previous);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }

    if (path === "/" || path === "/home") {
      return location.pathname === "/" || location.pathname === "/home";
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    navigate("/logout-confirmation");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(`/home?search=${encodeURIComponent(query)}`);

    setIsSearchOpen(false);
    setSearchQuery("");
    closeMobileMenu();
  };

  const userName =
    currentUser?.fullName?.trim() ||
    currentUser?.name?.trim() ||
    currentUser?.email?.split("@")?.[0] ||
    "Chef";

  const firstName = userName.split(" ")[0];
  const userInitial = firstName.charAt(0).toUpperCase();

  const avatarUrl = currentUser?.avatar
    ? getImageUrl(currentUser.avatar)
    : null;

  const renderNavigationLink = (item, mobile = false) => {
    const IconComponent = item.icon;
    const active = isActivePath(item.path, item.exact);

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={mobile ? closeMobileMenu : undefined}
        className={`flex items-center gap-2 ${
          mobile ? "gap-3 px-3.5 py-3" : "px-3.5 py-2"
        } rounded-lg text-sm font-medium transition-all ${
          active
            ? "bg-primary text-primary-foreground shadow-sm font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        }`}
      >
        <IconComponent
          className={mobile ? "w-5 h-5 shrink-0" : "w-4 h-4 shrink-0"}
        />

        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 transition-colors border-b shadow-sm border-border/80 bg-background/85 backdrop-blur-md">
        <div className="container px-4 mx-auto sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and desktop navigation */}
            <div className="flex items-center min-w-0 gap-6">
              <NavigationLogo />

              <div className="items-center hidden space-x-1 md:flex">
                {navigationItems.map((item) => renderNavigationLink(item))}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {currentUser && currentUser.role !== 'admin' && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen((p) => !p)}
                    className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {userNotifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 text-[9px] font-bold rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        {userNotifCount > 99 ? '99+' : userNotifCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-warm-lg z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                        {userNotifCount > 0 && (
                          <button onClick={() => { markAllUserRead(); }} className="text-xs text-primary hover:underline">Mark all read</button>
                        )}
                      </div>
                      {userNotifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                          <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {userNotifications.slice(0, 15).map((n) => {
                            const notifData = n.notification || n;
                            const isRead = n.isRead;
                            return (
                              <div
                                key={n._id}
                                onClick={() => { if (!isRead) markUserNotifAsRead(n._id); setIsNotifOpen(false); }}
                                className={`px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${ !isRead ? 'bg-primary/5' : '' }`}
                              >
                                <div className="flex items-start gap-2">
                                  {!isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${ !isRead ? 'text-foreground' : 'text-foreground/80' }`}>{notifData.title || 'Notification'}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notifData.message}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <ThemeToggle />

              {/* Search toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen((previous) => !previous)}
                className={`p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/70 ${
                  isSearchOpen ? "bg-muted text-foreground" : ""
                }`}
                aria-label="Toggle search bar"
                aria-expanded={isSearchOpen}
                title="Search recipes"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Authenticated user */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((previous) => !previous)}
                    className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-full sm:rounded-lg border border-border/70 hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-expanded={isUserMenuOpen}
                    aria-label="User account menu"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={userName}
                        className="object-cover w-8 h-8 border rounded-full border-border"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            "/assets/images/no_image.png";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full bg-primary/15 text-primary">
                        {userInitial}
                      </div>
                    )}

                    <span className="hidden sm:inline-block text-sm font-medium text-foreground max-w-[110px] truncate">
                      {firstName}
                    </span>

                    <ChevronDown
                      className={`hidden sm:inline-block w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User/Admin dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-50 py-1 mt-2 border w-60 rounded-xl border-border bg-card shadow-warm-lg animate-fadeIn">
                      <div className="px-4 py-3 border-b border-border/70">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate text-foreground">
                            {userName}
                          </p>

                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              ADMIN
                            </span>
                          )}
                        </div>

                        {currentUser.email && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {currentUser.email}
                          </p>
                        )}
                      </div>

                      <div className="py-1">
                        {isAdmin ? (
                          <>
                            <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Administration
                            </p>

                            {adminNavigationItems.map((item) => {
                              const IconComponent = item.icon;
                              const active = isActivePath(
                                item.path,
                                item.exact,
                              );

                              return (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                                    active
                                      ? "bg-primary/10 text-primary font-semibold"
                                      : "text-foreground hover:bg-muted/70"
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                  <span>{item.label}</span>
                                </Link>
                              );
                            })}

                            <div className="my-1 border-t border-border/70" />

                            <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              My Account
                            </p>

                            <Link
                              to="/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span>My Profile</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                            >
                              <User className="w-4 h-4 text-primary" />
                              <span>My Profile</span>
                            </Link>

                            <Link
                              to="/favorites"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                            >
                              <Heart className="w-4 h-4 text-destructive" />
                              <span>Favorites</span>
                            </Link>

                            <Link
                              to="/add-recipe"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-primary" />
                              <span>Add Recipe</span>
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="pt-1 border-t border-border/70">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleLogin}
                  className="font-medium shadow-sm"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="p-2 transition-colors rounded-lg md:hidden text-muted-foreground hover:text-foreground hover:bg-muted/70"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <div className="relative z-40 border-b shadow-sm border-border bg-card/95 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleSearchSubmit}
            className="container flex items-center max-w-3xl gap-3 px-4 py-3 mx-auto"
          >
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />

            <input
              type="text"
              placeholder="Search recipes by name, ingredient, category..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
              className="flex-1 min-w-0 text-sm bg-transparent border-none outline-none text-foreground sm:text-base placeholder:text-muted-foreground"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-2 py-1 text-xs rounded text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}

            <Button type="submit" size="sm" className="shrink-0">
              Search
            </Button>

            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Close search bar"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-xs"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          />

          {/* Sidebar */}
          <aside className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border shadow-2xl flex flex-col z-[70] animate-fadeIn">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <NavigationLogo />

              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile search */}
            <div className="p-4 border-b border-border/70">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted border-border"
              >
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />

                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="flex-1 min-w-0 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />

                <button
                  type="submit"
                  className="text-xs font-medium text-primary"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Mobile user information */}
            {currentUser && (
              <div className="flex items-center gap-3 p-4 border-b bg-muted/40 border-border">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="object-cover w-10 h-10 border rounded-full border-border shrink-0"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/assets/images/no_image.png";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 text-base font-bold rounded-full bg-primary/20 text-primary shrink-0">
                    {userInitial}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {userName}
                  </p>

                  <p className="text-xs truncate text-muted-foreground">
                    {currentUser.email}
                  </p>

                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-primary">
                      <ShieldCheck className="w-3 h-3" />
                      ADMIN ACCOUNT
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Mobile notification drawer section */}
            {currentUser && currentUser.role !== "admin" && (
              <div className="p-4 border-b border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notifications</span>
                    {userNotifCount > 0 && (
                      <span className="min-w-[16px] h-[16px] px-1 text-[9px] font-bold rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        {userNotifCount > 99 ? "99+" : userNotifCount}
                      </span>
                    )}
                  </div>
                  {userNotifCount > 0 && (
                    <button
                      onClick={markAllUserRead}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {userNotifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-1">No notifications yet</p>
                ) : (
                  <div className="divide-y divide-border/60 max-h-40 overflow-y-auto">
                    {userNotifications.slice(0, 5).map((n) => {
                      const notifData = n.notification || n;
                      const isRead = n.isRead;
                      return (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!isRead) markUserNotifAsRead(n._id);
                            closeMobileMenu();
                          }}
                          className={`py-2 text-xs cursor-pointer ${
                            !isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          <p className="truncate">{notifData.title || "Notification"}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {notifData.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mobile navigation */}
            <div className="flex-1 p-4 space-y-1 overflow-y-auto">
              {isAdmin && (
                <p className="px-3.5 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Administration
                </p>
              )}

              {navigationItems.map((item, index) => (
                <React.Fragment key={item.path}>
                  {isAdmin && index === adminNavigationItems.length && (
                    <div className="my-3 border-t border-border/70" />
                  )}

                  {renderNavigationLink(item, true)}
                </React.Fragment>
              ))}

              {currentUser && (
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActivePath("/profile")
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </Link>
              )}
            </div>

            {/* Drawer footer */}
            <div className="p-4 space-y-3 border-t border-border">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    fullWidth
                    onClick={() => {
                      closeMobileMenu();
                      handleLogin();
                    }}
                  >
                    Sign In
                  </Button>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="text-xs text-center transition text-muted-foreground hover:text-primary"
                  >
                    Don't have an account? Sign up
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default TopNavigation;
