import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Modal from "../components/modal"; 

const ProtectedRoute = ({ children }) => {
  const [showModal, setShowModal] = useState(false);

  const token =
    localStorage.getItem("recipeHub-token") ||
    sessionStorage.getItem("recipeHub-token");

  useEffect(() => {
    if (!token) {
      setShowModal(true);
    }
  }, [token]);

  if (!token) {
    return (
      <>
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Login Required"
        >
          <p className="mb-4">
            You must be logged in to access this page. Please login first.
          </p>
          <a
            href="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            Go to Login
          </a>
        </Modal>
        {/* Agar login nahi hai, kuch bhi render na ho */}
        <div />
      </>
    );
  }

  return children;
};

export default ProtectedRoute;