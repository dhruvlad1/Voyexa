import React from 'react';

export const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  return (
    <button
      className={`${baseStyles} ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";
