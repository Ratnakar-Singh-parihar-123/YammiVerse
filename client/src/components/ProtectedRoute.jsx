import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "./modal";
import { getAuthToken } from "../utils/auth";
import Button from "./ui/Button";
import Icon from "./AppIcon";

const ProtectedRoute = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const token = getAuthToken();

  useEffect(() => {
    if (!token) {
      setShowModal(true);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Sign In Required"
        >
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Icon name="Lock" size={24} />
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              You need to be signed in to YammiVerse to access this feature. Please sign in or create an account.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="default" className="shadow-sm font-semibold">
                <Link to="/login" state={{ from: location.pathname }}>
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;