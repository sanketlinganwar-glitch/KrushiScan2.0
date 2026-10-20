import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xs';

  const variants = {
    // Forest Green #0B5137 Main Buttons (Primary requirement) with smooth hover to #073D2A
    primary: 'bg-[#0B5137] hover:bg-[#073D2A] text-white focus:ring-[#0B5137] shadow-sm text-base font-bold transition-colors duration-200',
    // Leaf Green #2F9E59 (Secondary action, agricultural highlights)
    secondary: 'bg-[#2F9E59] hover:bg-[#258249] text-white focus:ring-[#2F9E59] shadow-sm font-semibold transition-colors duration-200',
    // High-contrast clean white button with subtle green border #DDE8DC
    outline: 'border border-[#DDE8DC] hover:border-[#2F9E59] bg-white text-[#152D24] hover:bg-[#E6F2E5] focus:ring-[#2F9E59] shadow-xs font-semibold transition-all duration-200',
    // Danger / Red #C83E3E (Warnings, destructive actions)
    danger: 'bg-[#C83E3E] hover:bg-[#a93030] text-white focus:ring-[#C83E3E] font-bold shadow-sm',
    // Success / #21864A
    success: 'bg-[#21864A] hover:bg-[#1a6d3c] text-white focus:ring-[#21864A] font-bold shadow-sm',
    // Info / Leaf Green
    info: 'bg-[#2F9E59] hover:bg-[#258249] text-white focus:ring-[#2F9E59] font-bold shadow-sm',
    // Ghost
    ghost: 'bg-transparent text-[#5F7065] hover:text-[#152D24] hover:bg-[#E6F2E5] focus:ring-[#0B5137] shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 rounded-2xl',
    xl: 'px-7 py-4 text-lg font-bold gap-3 rounded-2xl shadow-md',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#2F9E59]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          लोड होत आहे...
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
