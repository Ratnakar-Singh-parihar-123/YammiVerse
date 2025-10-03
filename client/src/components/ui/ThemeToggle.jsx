import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import Button from './Button';
import { cn } from '../../utils/cn';

const ThemeToggle = ({ className, variant = 'ghost', size = 'icon', ...props }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn('transition-theme', className)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      {...props}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;