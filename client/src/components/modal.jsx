import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Icon from "./AppIcon";

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Modal Title",
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  requireLogin = false,
}) => {
  const navigate = useNavigate();

  // ✅ ESC key listener
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    const token =
      localStorage.getItem("recipeHub-token") ||
      sessionStorage.getItem("recipeHub-token");

    // ✅ Agar login required hai aur user login nahi hai → home pe bhejo
    if (requireLogin && !token) {
      navigate("/", { replace: true });
    } else {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4"
          role="dialog"
          aria-modal="true"
          onClick={handleClose} // ✅ Backdrop click → close
        >
          {/* Stop click inside modal from closing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()} // ❌ Prevent backdrop close
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {title}
              </h2>
              <button
                onClick={handleClose} 
                className="p-2 rounded-full hover:bg-muted transition"
                aria-label="Close modal"
              >
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 text-muted-foreground text-sm sm:text-base leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-muted/30">
              <button
                onClick={handleClose} // ✅ Cancel button bhi handleClose karega
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition"
              >
                {cancelText}
              </button>
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition shadow"
                >
                  {confirmText}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;