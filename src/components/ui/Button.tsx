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
    // Navy #0A2540 Main Buttons (Prompt requirement)
    primary: 'bg-[#0A2540] hover:bg-[#071A2E] text-white focus:ring-[#0A2540] shadow-sm text-base font-bold',
    // India Green #138808 (Profit, high confidence, secondary action)
    secondary: 'bg-[#138808] hover:bg-[#0f6e06] text-white focus:ring-[#138808] shadow-sm',
    // High-contrast clean white button with Line #D5DEE8 border
    outline: 'border border-[#D5DEE8] hover:border-[#3B6EA5] bg-white text-[#0A2540] hover:bg-[#EEF3F8] focus:ring-[#3B6EA5] shadow-xs',
    // Danger / Red #C0392B (Deductions, warnings, destructive)
    danger: 'bg-[#C0392B] hover:bg-[#a93226] text-white focus:ring-[#C0392B]',
    // Success / India Green
    success: 'bg-[#138808] hover:bg-[#0f6e06] text-white focus:ring-[#138808]',
    // Blue #3B6EA5 button (fees, details)
    info: 'bg-[#3B6EA5] hover:bg-[#2d5885] text-white focus:ring-[#3B6EA5]',
    // Ghost
    ghost: 'bg-transparent text-[#5B6B7D] hover:text-[#0A2540] hover:bg-[#EEF3F8] focus:ring-[#0A2540] shadow-none',
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
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#3B6EA5]" fill="none" viewBox="0 0 24 24">
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
