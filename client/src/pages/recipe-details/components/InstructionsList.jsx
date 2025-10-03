import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const InstructionsList = ({ instructions = [], onProgressChange }) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Handle toggle step
  const toggleStepCompletion = (stepIndex) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepIndex)) {
      newCompletedSteps.delete(stepIndex);
    } else {
      newCompletedSteps.add(stepIndex);
    }
    setCompletedSteps(newCompletedSteps);

    //  Notify parent (for backend/localStorage sync)
    if (onProgressChange) {
      onProgressChange({
        completed: newCompletedSteps.size,
        total: instructions.length,
        completedSteps: Array.from(newCompletedSteps),
      });
    }
  };

  // Reset progress when instructions change
  useEffect(() => {
    setCompletedSteps(new Set());
  }, [instructions]);

  const progress =
    instructions.length > 0
      ? (completedSteps.size / instructions.length) * 100
      : 0;

  return (
    <div className="bg-card rounded-lg shadow-warm p-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="BookOpen" size={24} color="var(--color-primary)" />
        <h2 className="text-xl font-heading font-semibold text-foreground">
          Instructions
        </h2>
      </div>

      {/* Steps */}
      {instructions.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">
          No instructions available for this recipe.
        </p>
      ) : (
        <div className="space-y-4">
          {instructions.map((instruction, index) => {
            const isCompleted = completedSteps.has(index);

            return (
              <div
                key={index}
                className={`flex space-x-4 p-4 rounded-lg border transition-micro ${
                  isCompleted
                    ? 'bg-success/10 border-success/20'
                    : 'bg-background border-border hover:border-primary/20'
                }`}
              >
                {/* Step Number / Checkbox */}
                <button
                  onClick={() => toggleStepCompletion(index)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-micro ${
                    isCompleted
                      ? 'bg-success text-success-foreground'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  aria-label={`Mark step ${index + 1} as ${
                    isCompleted ? 'incomplete' : 'complete'
                  }`}
                >
                  {isCompleted ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                {/* Instruction Text */}
                <div className="flex-1">
                  <p
                    className={`leading-relaxed transition-micro ${
                      isCompleted
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {instruction?.text}
                  </p>

                  {instruction?.tip && (
                    <div className="mt-2 p-3 bg-warning/10 border border-warning/20 rounded-md">
                      <div className="flex items-start space-x-2">
                        <Icon
                          name="Lightbulb"
                          size={16}
                          color="var(--color-warning)"
                          className="mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm text-warning-foreground">
                          <span className="font-medium">Tip:</span>{' '}
                          {instruction?.tip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Indicator */}
      {instructions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>
              {completedSteps.size} of {instructions.length} steps completed
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructionsList;