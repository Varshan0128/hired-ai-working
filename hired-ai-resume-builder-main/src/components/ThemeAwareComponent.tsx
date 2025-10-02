import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeAwareComponentProps {
  children: React.ReactNode;
  className?: string;
  lightModeClasses?: string;
  darkModeClasses?: string;
}

const ThemeAwareComponent: React.FC<ThemeAwareComponentProps> = ({
  children,
  className = '',
  lightModeClasses = '',
  darkModeClasses = ''
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        className,
        theme === 'light' ? lightModeClasses : darkModeClasses
      )}
    >
      {children}
    </div>
  );
};

export default ThemeAwareComponent;