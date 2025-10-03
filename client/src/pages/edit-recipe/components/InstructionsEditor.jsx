import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const InstructionsEditor = ({ instructions, onInstructionsChange, error }) => {
  const addInstruction = () => {
    const newInstructions = [
      ...instructions,
      { id: Date.now(), step: instructions.length + 1, text: '' }, //  step + text
    ];
    onInstructionsChange(newInstructions);
  };

  const removeInstruction = (id) => {
    const filtered = instructions.filter((inst) => (inst.id || inst._id) !== id);
    // Renumber step after removal
    const renumbered = filtered.map((inst, idx) => ({
      ...inst,
      step: idx + 1,
    }));
    onInstructionsChange(renumbered);
  };

  const updateInstruction = (id, value) => {
    const updated = instructions.map((inst) =>
      (inst.id || inst._id) === id ? { ...inst, text: value } : inst
    );
    onInstructionsChange(updated);
  };

  const moveInstruction = (index, direction) => {
    const newInstructions = [...instructions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newInstructions.length) {
      [newInstructions[index], newInstructions[targetIndex]] = [
        newInstructions[targetIndex],
        newInstructions[index],
      ];
      // Renumber steps after reorder
      const renumbered = newInstructions.map((inst, idx) => ({
        ...inst,
        step: idx + 1,
      }));
      onInstructionsChange(renumbered);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Instructions
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInstruction}
          iconName="Plus"
          iconPosition="left"
          iconSize={16}
        >
          Add Step
        </Button>
      </div>

      {/* Instruction List */}
      <div className="space-y-3">
        {instructions.map((inst, index) => {
          const key = inst.id || inst._id || index;
          return (
            <div
              key={key}
              className="flex items-start space-x-3 p-4 bg-card rounded-lg border border-border"
            >
              {/* Move Buttons */}
              <div className="flex flex-col space-y-1 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => moveInstruction(index, 'up')}
                  disabled={index === 0}
                  iconName="ChevronUp"
                  iconSize={14}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => moveInstruction(index, 'down')}
                  disabled={index === instructions.length - 1}
                  iconName="ChevronDown"
                  iconSize={14}
                />
              </div>

              {/* Step Number */}
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium flex-shrink-0 mt-2">
                {inst.step}
              </div>

              {/* Step Text */}
              <div className="flex-1">
                <textarea
                  value={inst.text}
                  onChange={(e) => updateInstruction(key, e.target.value)}
                  placeholder={`Describe step ${inst.step}...`}
                  className="w-full min-h-[80px] p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
                  required
                />
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInstruction(key)}
                iconName="Trash2"
                iconSize={16}
                className="text-destructive hover:text-destructive mt-2"
              />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {instructions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="List" size={48} className="mx-auto mb-2 opacity-50" />
          <p>No instructions added yet</p>
          <p className="text-sm">Click "Add Step" to get started</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default InstructionsEditor;