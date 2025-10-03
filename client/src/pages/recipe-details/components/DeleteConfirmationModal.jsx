import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, recipeName }) => {
  // ❌ Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ❌ Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-warm-lg max-w-md w-full mx-4 animate-in fade-in zoom-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-destructive/10 rounded-full">
                <Icon name="AlertTriangle" size={20} color="var(--color-destructive)" />
              </div>
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Delete Recipe
              </h2>
            </div>

            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-micro"
              aria-label="Close modal"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-foreground mb-2">
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{recipeName}"</span>?
            </p>
            <p className="text-muted-foreground text-sm">
              This action <strong>cannot</strong> be undone. The recipe will be
              permanently removed from your collection.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              iconName="Trash2"
              iconPosition="left"
              onClick={onConfirm}
            >
              Delete Recipe
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmationModal;