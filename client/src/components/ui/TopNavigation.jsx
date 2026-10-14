import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Volume2,
  VolumeX,
} from "lucide-react";

import Button from "./Button";
import NavigationLogo from "./NavigationLogo";
import ThemeToggle from "./ThemeToggle";
import { getAuthUser } from "../../utils/auth";
import { getImageUrl } from "../../utils/api";
import { useUserNotifications } from "../../contexts/UserNotificationContext";

const SOUND_PREF_KEY = "topnav:notification-sound";

/** Safe date formatter */
const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_PREF_KEY) !== "off";
    } catch {
      return true;
    }
  });
  const [isBellRinging, setIsBellRinging] = useState(false);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ringTimeoutRef = useRef(null);
  const prevNotifCountRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  /*  AUDIO : soft "tun–tan" chime                                      */
  /* ------------------------------------------------------------------ */

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioCtx();
      } catch {
        return null;
      }
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }

    return audioCtxRef.current;
  }, []);

  const playNotificationSound = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.02;

    const playTone = (frequency, startAt, duration, peak) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, startAt);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(startAt + duration + 0.05);
    };

    // "tun" ... "tan"
    playTone(880, now, 0.16, 0.16);
    playTone(1174.66, now + 0.17, 0.3, 0.13);
  }, [ensureAudioContext]);

  // Unlock audio on first user gesture (browser policy)
  useEffect(() => {
    const unlock = () => ensureAudioContext();

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [ensureAudioContext]);

  // Cleanup audio context + timers
  useEffect(
    () => () => {
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      audioCtxRef.current?.close?.().catch(() => {});
      audioCtxRef.current = null;
    },
    [],
  );

  // Detect a NEW notification -> play chime + ring the bell
  useEffect(() => {
    if (prevNotifCountRef.current === null) {
      prevNotifCountRef.current = userNotifCount;
      return;
    }

    if (userNotifCount > prevNotifCountRef.current) {
      if (soundEnabled) playNotificationSound();

      setIsBellRinging(true);
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = setTimeout(() => setIsBellRinging(false), 1400);
    }

    prevNotifCountRef.current = userNotifCount;
  }, [userNotifCount, soundEnabled, playNotificationSound]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_PREF_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      if (next) playNotificationSound();
      return next;
    });
  };

  /* ------------------------------------------------------------------ */
  /*  AUTH                                                              */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const loadUser = () => setCurrentUser(getAuthUser());

    loadUser();

    window.addEventListener("auth-change", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /*  UI EFFECTS                                                        */
  /* ------------------------------------------------------------------ */

  // Close everything on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
    setIsNotifOpen(false);
    setSelectedNotification(null);
  }, [location.pathname]);

  // Click outside
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
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setSelectedNotification(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  /* ------------------------------------------------------------------ */
  /*  DERIVED                                                           */
  /* ------------------------------------------------------------------ */

  const isAdmin = currentUser?.role === "admin";

  const userNavigationItems = [
    { path: "/home", label: "Explore", icon: ChefHat },
    { path: "/favorites", label: "Favorites", icon: Heart },
    { path: "/add-recipe", label: "Add Recipe", icon: Plus },
    { path: "/about", label: "About", icon: Info },
  ];

  const adminNavigationItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { path: "/admin/users", label: "Manage Users", icon: Users },
    { path: "/admin/recipes", label: "Manage Recipes", icon: BookOpen },
  ];

  const navigationItems = isAdmin
    ? [...adminNavigationItems, ...userNavigationItems]
    : userNavigationItems;

  const toggleMobileMenu = () => setIsMobileMenuOpen((p) => !p);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActivePath = (path, exact = false) => {
    if (exact) return location.pathname === path;

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

  const handleLogin = () => navigate("/login");

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

  /* ------------------------------------------------------------------ */
  /*  NOTIFICATIONS                                                     */
  /* ------------------------------------------------------------------ */

  const openNotification = (entry) => {
    const data = entry.notification || entry;

    if (!entry.isRead) markUserNotifAsRead(entry._id);

    setSelectedNotification({
      id: entry._id,
      title: data.title || "Notification",
      message: data.message || "",
      type: data.type || "",
      link: data.link || data.actionUrl || data.url || "",
      createdAt: data.createdAt || entry.createdAt || null,
    });

    setIsNotifOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeNotificationModal = () => setSelectedNotification(null);

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

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <>
      {/* ============================ NAVBAR ============================ */}
      <nav className="sticky top-0 z-50 transition-colors border-b shadow-sm border-border/80 bg-background/85 backdrop-blur-md">
        <div className="container px-4 mx-auto sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + desktop nav */}
            <div className="flex items-center min-w-0 gap-6">
              <NavigationLogo />

              <div className="items-center hidden space-x-1 md:flex">
                {navigationItems.map((item) => renderNavigationLink(item))}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* ---------------- Notification bell ---------------- */}
              {currentUser && currentUser.role !== "admin" && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen((p) => !p)}
                    className={`relative p-2 rounded-lg transition-all duration-300 ${
                      isBellRinging
                        ? "bg-primary/10 text-primary scale-110"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    aria-label="Notifications"
                    aria-expanded={isNotifOpen}
                  >
                    {isBellRinging && (
                      <span className="absolute inset-0 rounded-lg bg-primary/25 animate-ping" />
                    )}

                    <Bell
                      className={`relative w-5 h-5 transition-transform duration-300 ${
                        isBellRinging ? "-rotate-12" : ""
                      }`}
                    />

                    {userNotifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 text-[9px] font-bold rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        {userNotifCount > 99 ? "99+" : userNotifCount}
                      </span>
                    )}
                  </button>

                  {/* Notification panel — full width on phone, dropdown on desktop */}
                  {isNotifOpen && (
                    <div className="fixed left-3 right-3 top-[4.5rem] z-50 animate-fadeIn sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
                      <div className="flex flex-col max-h-[70vh] overflow-hidden border rounded-2xl border-border bg-card shadow-warm-lg sm:max-h-96 sm:rounded-xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 border-border">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              Notifications
                            </h3>
                            {userNotifCount > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                {userNotifCount > 99 ? "99+" : userNotifCount}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={toggleSound}
                              title={
                                soundEnabled
                                  ? "Mute notification sound"
                                  : "Unmute notification sound"
                              }
                              aria-label={
                                soundEnabled
                                  ? "Mute notification sound"
                                  : "Unmute notification sound"
                              }
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              {soundEnabled ? (
                                <Volume2 className="w-4 h-4" />
                              ) : (
                                <VolumeX className="w-4 h-4" />
                              )}
                            </button>

                            {userNotifCount > 0 && (
                              <button
                                type="button"
                                onClick={markAllUserRead}
                                className="text-xs font-medium text-primary hover:underline"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto overscroll-contain">
                          {userNotifications.length === 0 ? (
                            <div className="py-10 text-center">
                              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                              <p className="text-sm text-muted-foreground">
                                No notifications yet
                              </p>
                            </div>
                          ) : (
                            <div className="divide-y divide-border">
                              {userNotifications.slice(0, 15).map((n) => {
                                const data = n.notification || n;
                                const isRead = n.isRead;

                                return (
                                  <button
                                    type="button"
                                    key={n._id}
                                    onClick={() => openNotification(n)}
                                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${
                                      !isRead ? "bg-primary/5" : ""
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      {!isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={`text-sm truncate ${
                                            !isRead
                                              ? "font-semibold text-foreground"
                                              : "font-medium text-foreground/80"
                                          }`}
                                        >
                                          {data.title || "Notification"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                          {data.message}
                                        </p>
                                        {(data.createdAt || n.createdAt) && (
                                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                                            {formatDateTime(
                                              data.createdAt || n.createdAt,
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <ThemeToggle />

              {/* Search toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen((p) => !p)}
                className={`p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/70 ${
                  isSearchOpen ? "bg-muted text-foreground" : ""
                }`}
                aria-label="Toggle search bar"
                aria-expanded={isSearchOpen}
                title="Search recipes"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User menu */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((p) => !p)}
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

      {/* ======================= SEARCH BAR ======================= */}
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

      {/* ==================== MOBILE DRAWER (smooth) ==================== */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${
          isMobileMenuOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={closeMobileMenu}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Sidebar (slides in from the LEFT) */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute left-0 top-0 bottom-0 z-10 flex w-80 max-w-[85vw] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out will-change-transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
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

          {/* Mobile user info */}
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

          {/* Mobile notifications */}
          {currentUser && currentUser.role !== "admin" && (
            <div className="p-4 space-y-2 border-b border-border/70">
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
                    type="button"
                    onClick={markAllUserRead}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {userNotifications.length === 0 ? (
                <p className="py-1 text-xs text-muted-foreground">
                  No notifications yet
                </p>
              ) : (
                <div className="overflow-y-auto divide-y max-h-40 divide-border/60">
                  {userNotifications.slice(0, 5).map((n) => {
                    const data = n.notification || n;
                    const isRead = n.isRead;

                    return (
                      <button
                        type="button"
                        key={n._id}
                        onClick={() => openNotification(n)}
                        className={`w-full text-left py-2 text-xs ${
                          !isRead
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        <p className="truncate">
                          {data.title || "Notification"}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {data.message}
                        </p>
                      </button>
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

      {/* ================== NOTIFICATION DETAIL MODAL ================== */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Notification details"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={closeNotificationModal}
          />

          {/* Card / bottom sheet */}
          <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-2xl border border-border bg-card shadow-2xl animate-fadeIn sm:max-w-lg sm:rounded-2xl">
            {/* Mobile grab handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 px-5 pt-4 pb-4 border-b border-border sm:pt-5">
              <div className="flex items-center justify-center rounded-full h-11 w-11 shrink-0 bg-primary/10 text-primary">
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold break-words text-foreground">
                  {selectedNotification.title}
                </h3>

                {selectedNotification.createdAt && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(selectedNotification.createdAt)}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeNotificationModal}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                aria-label="Close notification details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm leading-relaxed break-words whitespace-pre-line text-foreground/90">
                {selectedNotification.message ||
                  "No further details available for this notification."}
              </p>

              {selectedNotification.type && (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {selectedNotification.type}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
              {selectedNotification.link && (
                <a
                  href={selectedNotification.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-opacity rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                  onClick={closeNotificationModal}
                >
                  Open
                </a>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={closeNotificationModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavigation;
