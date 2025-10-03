import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const InstructionsSection = ({ instructions, onInstructionsChange, error }) => {
  const addInstruction = () => {
    const newInstructions = [...instructions, { id: Date.now(), step: instructions?.length + 1, text: '' }];
    onInstructionsChange(newInstructions);
  };

  const removeInstruction = (id) => {
    const newInstructions = instructions?.filter(instruction => instruction?.id !== id)?.map((instruction, index) => ({ ...instruction, step: index + 1 }));
    onInstructionsChange(newInstructions);
  };

  const updateInstruction = (id, text) => {
    const newInstructions = instructions?.map(instruction =>
      instruction?.id === id ? { ...instruction, text } : instruction
    );
    onInstructionsChange(newInstructions);
  };

  const moveInstruction = (id, direction) => {
    const currentIndex = instructions?.findIndex(instruction => instruction?.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === instructions?.length - 1)
    ) {
      return;
    }

    const newInstructions = [...instructions];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newInstructions[currentIndex], newInstructions[targetIndex]] = 
    [newInstructions?.[targetIndex], newInstructions?.[currentIndex]];
    
    // Update step numbers
    const reorderedInstructions = newInstructions?.map((instruction, index) => ({
      ...instruction,
      step: index + 1
    }));
    
    onInstructionsChange(reorderedInstructions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Instructions *
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
      <div className="space-y-3">
        {instructions?.map((instruction, index) => (
          <div key={instruction?.id} className="flex items-start space-x-3 p-4 bg-card rounded-lg border border-border">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {instruction?.step}
            </div>
            <div className="flex-1">
              <textarea
                placeholder={`Describe step ${instruction?.step}...`}
                value={instruction?.text}
                onChange={(e) => updateInstruction(instruction?.id, e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveInstruction(instruction?.id, 'up')}
                disabled={index === 0}
                className="p-1 h-8 w-8"
              >
                <Icon name="ChevronUp" size={16} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveInstruction(instruction?.id, 'down')}
                disabled={index === instructions?.length - 1}
                className="p-1 h-8 w-8"
              >
                <Icon name="ChevronDown" size={16} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInstruction(instruction?.id)}
                className="p-1 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {instructions?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="List" size={24} className="mx-auto mb-2 opacity-50" />
          <p>No instructions added yet. Click "Add Step" to get started.</p>
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default InstructionsSection;