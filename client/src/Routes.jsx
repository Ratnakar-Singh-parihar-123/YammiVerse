import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ThemeProvider from "components/ThemeProvider";
import { UserNotificationProvider } from "./contexts/UserNotificationContext";
import NotFound from "pages/NotFound";
import FavoritesPage from "./pages/favorites";
import ProfilePage from "./pages/profile";
import EditRecipe from "./pages/edit-recipe";
import HomePage from "./pages/home";
import AddRecipe from "./pages/add-recipe";
import RecipeDetailsPage from "./pages/recipe-details";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import CombinedAuth from "./pages/combined-auth";
import LogoutConfirmation from "./pages/logout-confirmation";
import Footer from "components/Footer";
import ProtectedRoute from "components/ProtectedRoute";
import AdminRoute from "components/AdminRoute";
import AboutSection from "components/About";
import ContactSection from "components/Contact";
import ForgotPassword from "./components/ForgotPasswordFlow";
import PrivacyPolicySection from "components/PrivacyPolicySection";
import AddShoppingList from "./pages/recipe-details/components/ShoppingList";

// ── Admin pages ──────────────────────────────────────────────────────────────
import AdminLayout from "./pages/admin/layout/AdminLayout";
import AdminDashboard from "./pages/admin/dashboard";
import AdminUsersPage from "./pages/admin/users";
import AdminRecipesPage from "./pages/admin/recipes";
import AdminNotificationsPage from "./pages/admin/notifications";
import AdminProfilePage from "./pages/admin/profile";

// ── User-facing layout wrapper (has Footer) ───────────────────────────────────
const UserLayout = ({ children }) => (
  <>
    {children}
    <Footer />
  </>
);

const Routes = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ErrorBoundary>
          <UserNotificationProvider>
            <ScrollToTop />
          <RouterRoutes>
            {/* ── Public Discovery Routes ── */}
            <Route path="/" element={<UserLayout><HomePage /></UserLayout>} />
            <Route path="/home" element={<UserLayout><HomePage /></UserLayout>} />
            <Route path="/recipes/:id" element={<UserLayout><RecipeDetailsPage /></UserLayout>} />
            <Route path="/about" element={<UserLayout><AboutSection /></UserLayout>} />
            <Route path="/contact" element={<UserLayout><ContactSection /></UserLayout>} />
            <Route path="/privacy" element={<UserLayout><PrivacyPolicySection /></UserLayout>} />
            <Route path="/terms" element={<UserLayout><PrivacyPolicySection /></UserLayout>} />
            <Route path="/shopping-list" element={<UserLayout><AddShoppingList /></UserLayout>} />
            <Route path="/shhopinglist" element={<UserLayout><AddShoppingList /></UserLayout>} />

            {/* ── Auth Routes ── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/combined-auth" element={<CombinedAuth />} />
            <Route path="/logout-confirmation" element={<LogoutConfirmation />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ── Protected User Routes ── */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <UserLayout><FavoritesPage /></UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserLayout><ProfilePage /></UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-recipe"
              element={
                <ProtectedRoute>
                  <UserLayout><AddRecipe /></UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-recipe/:id"
              element={
                <ProtectedRoute>
                  <UserLayout><EditRecipe /></UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes/edit/:id"
              element={
                <ProtectedRoute>
                  <UserLayout><EditRecipe /></UserLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Admin Routes (no Footer, own layout) ── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="recipes" element={<AdminRecipesPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>

            {/* ── 404 Fallback ── */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
          </UserNotificationProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default Routes;