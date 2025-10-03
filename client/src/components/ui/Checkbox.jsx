import React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

const Checkbox = React.forwardRef(
  (
    {
      className,
      id,
      checked = false,
      indeterminate = false,
      disabled = false,
      required = false,
      label,
      description,
      error,
      size = "default",
      onChange, 
      ...props
    },
    ref
  ) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: "h-4 w-4",
      default: "h-4 w-4",
      lg: "h-5 w-5",
    };

    return (
      <div className={cn("flex items-start space-x-2", className)}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            required={required}
            className="sr-only"
            
            onChange={(e) => onChange?.(e.target.checked)}
            {...props}
          />

          <label
            htmlFor={checkboxId}
            className={cn(
              "peer shrink-0 flex items-center justify-center rounded-sm border border-primary " +
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 " +
                "focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer transition-colors",
              sizeClasses[size],
              checked && "bg-primary text-primary-foreground border-primary",
              indeterminate && "bg-primary text-primary-foreground border-primary",
              error && "border-destructive",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {checked && !indeterminate && (
              <Check className="h-3 w-3 text-current" />
            )}
            {indeterminate && <Minus className="h-3 w-3 text-current" />}
          </label>
        </div>

        {(label || description || error) && (
          <div className="flex-1 space-y-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-sm font-medium leading-none cursor-pointer",
                  error ? "text-destructive" : "text-foreground"
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </label>
            )}
            {description && !error && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };