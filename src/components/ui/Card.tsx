import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'dark' | 'outline' | 'greenTint' | 'amberTint';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  padding = 'md',
  interactive = false,
  className = '',
  ...props
}) => {
  const base = 'rounded-2xl transition-all duration-200';

  const variants = {
    // Pure white card with clean subtle green border #DDE8DC and primary text #152D24
    white: 'bg-white text-[#152D24] border border-[#DDE8DC] shadow-xs',
    // Forest Green card #0B5137 with light green text
    dark: 'bg-[#0B5137] text-white border border-[#073D2A] shadow-sm',
    // Outline style with subtle green border
    outline: 'bg-white border-2 border-[#DDE8DC] text-[#152D24] hover:border-[#2F9E59]',
    // Subtle green tint card for agricultural highlights
    greenTint: 'bg-[#E6F2E5]/70 text-[#152D24] border border-[#2F9E59]/30',
    // Leaf Green highlight card
    saffronHighlight: 'bg-white text-[#152D24] border-2 border-[#2F9E59] shadow-md ring-2 ring-[#2F9E59]/25',
    // Amber/warning tint
    amberTint: 'bg-amber-50/80 text-[#152D24] border border-[#E9A23B]/40',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-[#2F9E59]/60 active:translate-y-0'
    : '';

  return (
    <div
      className={`${base} ${variants[variant]} ${paddings[padding]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
