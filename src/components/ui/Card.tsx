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
    // Pure white card with clean Line #D5DEE8 border and Navy text
    white: 'bg-white text-[#0A2540] border border-[#D5DEE8] shadow-xs',
    // Dark mode card #13243A with #EAF0F7 text (Dark mode rule)
    dark: 'bg-[#13243A] text-[#EAF0F7] border border-[#13243A] shadow-sm',
    // Outline style with Line border
    outline: 'bg-white border-2 border-[#D5DEE8] text-[#0A2540] hover:border-[#3B6EA5]',
    // Subtle green tint card for agricultural / profit highlights
    greenTint: 'bg-emerald-50/70 text-[#0A2540] border border-[#138808]/30',
    // Saffron border highlight card (for best market)
    saffronHighlight: 'bg-white text-[#0A2540] border-2 border-[#FF9933] shadow-md ring-2 ring-[#FF9933]/25',
    // Amber/warning tint
    amberTint: 'bg-amber-50/80 text-[#0A2540] border border-amber-200/80',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/40 active:translate-y-0'
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
