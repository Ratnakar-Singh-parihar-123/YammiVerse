import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Button from "./Button";
import NavigationLogo from "./NavigationLogo";
import ThemeToggle from "./ThemeToggle";

const TopNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("recipeHub-user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch {
        console.error("Error parsing user data");
      }
    }
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((p) => !p);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActivePath = (path) => location?.pathname === path;

  const handleLogout = () => navigate("/logout-confirmation");
  const handleLogin = () => navigate("/combined-auth");

  // ✅ Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      if (isMobileMenuOpen) closeMobileMenu();
    }
  };

  // ✅ Nav items
  const navigationItems = [
    { path: "/home", label: "Home", icon: ChefHat },
    { path: "/favorites", label: "Favorites", icon: Heart },
    { path: "/add-recipe", label: "Add Recipe", icon: Plus },
    { path: "/about", label: "About", icon: Info },
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavigationLogo />

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      isActivePath(item.path)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen((p) => !p)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle search"
              >
                <Search className="h-5 w-5" />
              </button>
              {/* User Menu */}
              {currentUser ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {currentUser?.name?.split(" ")?.[0] || "User"}
                    </span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-lg shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent rounded-t-lg"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-b-lg"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleLogin}>
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ Mobile Sidebar Menu (Left Slide) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={closeMobileMenu}
          ></div>

          {/* Sidebar */}
          <div className="relative w-72 max-w-[80%] h-full bg-background border-r border-border shadow-lg animate-slideInLeft p-4 flex flex-col">
            {/* Close Button */}
            <button
              onClick={closeMobileMenu}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mt-8"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </form>

            {/* Theme Toggle */}
            <div className="flex justify-between items-center bg-muted px-3 py-2 rounded-lg mt-4">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>

            {/* Nav Links */}
            <div className="flex flex-col gap-2 mt-6 flex-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActivePath(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="border-t border-border pt-4">
              {currentUser ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-md hover:bg-accent text-sm"
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10"
                  >
                    <LogOut className="inline h-4 w-4 mr-2" /> Logout
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogin();
                    closeMobileMenu();
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Expandable Search (Desktop only) */}
      <div
        className={`hidden md:block overflow-hidden transition-all duration-300 ${
          isSearchOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isSearchOpen && (
          <div className="bg-background border-b border-border shadow-md z-40">
            <form
              onSubmit={handleSearchSubmit}
              className="container mx-auto flex items-center gap-3 p-3"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default TopNavigation;