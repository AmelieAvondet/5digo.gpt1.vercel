import React from 'react';
import clsx from 'clsx';

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'border-transparent bg-blue-100 text-blue-800': variant === 'default',
          'border-transparent bg-gray-100 text-gray-800': variant === 'secondary',
          'border-transparent bg-red-100 text-red-800': variant === 'destructive',
          'border-gray-200 text-gray-800': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge };
