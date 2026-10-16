import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'saffron' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'success',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center font-bold rounded-full shrink-0 tracking-wide';

  const variants = {
    // Saffron Badge (Rank 1 badge, best market) - Saffron background with crisp WHITE text (Never saffron text on white!)
    saffron: 'bg-[#FF9933] text-white border border-[#FF9933] shadow-xs font-black',
    // India Green #138808 (Net return, profit, high confidence)
    success: 'bg-emerald-50 text-[#138808] border border-[#138808]/30 font-bold',
    // Red #C0392B (Shrinkage, deductions, warnings, below MSP)
    danger: 'bg-red-50 text-[#C0392B] border border-[#C0392B]/30 font-bold',
    // Blue #3B6EA5 (Loading and mandi fees, APMC info)
    info: 'bg-blue-50 text-[#3B6EA5] border border-[#3B6EA5]/30 font-bold',
    // Neutral (Slate #5B6B7D on Page #EEF3F8 with Line #D5DEE8 border)
    neutral: 'bg-[#EEF3F8] text-[#5B6B7D] border border-[#D5DEE8] font-semibold',
    // Warning
    warning: 'bg-amber-50 text-amber-900 border border-amber-200 font-bold',
    // Orange alias
    orange: 'bg-[#FF9933] text-white border border-[#FF9933] font-bold',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-semibold',
  };

  const dotColors = {
    saffron: 'bg-white',
    success: 'bg-[#138808]',
    warning: 'bg-amber-500',
    danger: 'bg-[#C0392B]',
    info: 'bg-[#3B6EA5]',
    neutral: 'bg-[#5B6B7D]',
    orange: 'bg-white',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {dot && <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[variant]} animate-pulse`} />}
      {children}
    </span>
  );
};
