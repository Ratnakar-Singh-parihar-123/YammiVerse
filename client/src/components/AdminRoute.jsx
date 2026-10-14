import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../utils/auth";
import api from "../utils/api";

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const token = getAuthToken();
  const cachedUser = getAuthUser();

  const [verifying, setVerifying] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      return;
    }

    // Quick check from cache first
    if (cachedUser?.role === "admin") {
      setIsAdmin(true);
      setVerifying(false);
      return;
    }

    // Verify with server (authoritative check)
    api
      .get("/api/users/me")
      .then((res) => {
        const role = res.data?.user?.role;
        setIsAdmin(role === "admin");
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => setVerifying(false));
  }, [token]);

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 rounded-full border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
