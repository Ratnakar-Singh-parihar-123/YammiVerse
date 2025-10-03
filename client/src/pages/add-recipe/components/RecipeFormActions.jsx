import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RecipeFormActions = ({ onSave, onCancel, isLoading, hasUnsavedChanges }) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      navigate('/home');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/home');
  };

  const continueCooking = () => {
    setShowCancelDialog(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="sm:order-2"
          iconName="X"
          iconPosition="left"
          iconSize={16}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={onSave}
          loading={isLoading}
          className="sm:order-1 flex-1"
          iconName="Save"
          iconPosition="left"
          iconSize={16}
        >
          {isLoading ? 'Saving Recipe...' : 'Save Recipe'}
        </Button>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <>
          <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={continueCooking} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-background border border-border rounded-lg shadow-warm-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <Icon name="AlertTriangle" size={20} className="text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Discard Recipe?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You have unsaved changes that will be lost.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={continueCooking}
                  className="flex-1"
                >
                  Continue Cooking
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmCancel}
                  className="flex-1"
                >
                  Discard Recipe
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RecipeFormActions;