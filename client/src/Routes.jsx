import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ThemeProvider from "components/ThemeProvider";
import NotFound from "pages/NotFound";
import FavoritesPage from './pages/favorites';
import ProfilePage from './pages/profile';
import EditRecipe from './pages/edit-recipe';
import HomePage from './pages/home';
import AddRecipe from './pages/add-recipe';
import RecipeDetailsPage from './pages/recipe-details';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import CombinedAuth from './pages/combined-auth';
import LogoutConfirmation from './pages/logout-confirmation';
import Footer from "components/Footer";
import ProtectedRoute from "components/ProtectedRoute";
import AboutSection from "components/About";
import ContactSection from "components/Contact";

//  Import Forgot / Reset Password pages
import ForgotPassword from "./components/ForgotPasswordFlow";
// import ResetPassword from "./components/ResetPassword";
import PrivacyPolicySection from "components/PrivacyPolicySection";
import AddShhopingList from "./pages/recipe-details/components/ShoppingList"

const Routes = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/combined-auth" element={<CombinedAuth />} />
            <Route path="/logout-confirmation" element={<LogoutConfirmation />} />
            <Route path="/about" element={<AboutSection />} />
            <Route path="/contact" element={<ContactSection />} />
            <Route path="/privacy" element={<PrivacyPolicySection />} />
            <Route path="/shhopinglist" element={<AddShhopingList />} />





            {/*  Forgot / Reset Password Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* <Route path="/reset-password/:token" element={<ResetPassword />} /> */}

            {/* Protected Routes */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-recipe/:id" //  Dynamic param
              element={
                <ProtectedRoute>
                  <EditRecipe />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-recipe"
              element={
                <ProtectedRoute>
                  <AddRecipe />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes/:id" //  Dynamic param
              element={
                <ProtectedRoute>
                  <RecipeDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
        <Footer />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default Routes;