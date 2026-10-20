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
    // Krushi Green Highlight Badge - Leaf Green with crisp white text
    saffron: 'bg-[#2F9E59] text-white border border-[#2F9E59] shadow-xs font-bold',
    // Success #21864A (Profit, healthy crop, high confidence)
    success: 'bg-[#E6F2E5] text-[#21864A] border border-[#21864A]/30 font-bold',
    // Error / Danger #C83E3E (Critical disease, losses, alerts)
    danger: 'bg-red-50 text-[#C83E3E] border border-[#C83E3E]/30 font-bold',
    // Info / Forest & Leaf Green
    info: 'bg-[#E6F2E5] text-[#0B5137] border border-[#0B5137]/30 font-bold',
    // Neutral (Slate #5F7065 on Page #F6F8F0 with subtle green border #DDE8DC)
    neutral: 'bg-[#F6F8F0] text-[#5F7065] border border-[#DDE8DC] font-semibold',
    // Warning #E9A23B
    warning: 'bg-amber-50 text-[#b5731b] border border-[#E9A23B]/40 font-bold',
    // Orange / Highlight alias
    orange: 'bg-[#E9A23B] text-white border border-[#E9A23B] font-bold',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-semibold',
  };

  const dotColors = {
    saffron: 'bg-white',
    success: 'bg-[#21864A]',
    warning: 'bg-[#E9A23B]',
    danger: 'bg-[#C83E3E]',
    info: 'bg-[#0B5137]',
    neutral: 'bg-[#5F7065]',
    orange: 'bg-white',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {dot && <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[variant]} animate-pulse`} />}
      {children}
    </span>
  );
};
