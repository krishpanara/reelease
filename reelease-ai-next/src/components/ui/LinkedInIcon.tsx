import React from 'react';
import { LucideProps } from 'lucide-react';

interface LinkedInIconProps extends LucideProps {
  filled?: boolean;
}

export const LinkedInIcon = React.forwardRef<SVGSVGElement, LinkedInIconProps>(
  ({ className, color, size = 24, filled = false, ...props }, ref) => {
    // Omit lucide-specific stroke props for custom SVG rendering
    const { stroke, strokeWidth, strokeLinecap, strokeLinejoin, fill, ...restProps } = props;

    if (filled) {
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          {...restProps}
        >
          <rect width="24" height="24" rx="5" fill="#0A66C2" />
          <path
            d="M6.5 8.5H9.5V19H6.5V8.5ZM8 4C9 4 9.8 4.8 9.8 5.8C9.8 6.8 9 7.6 8 7.6C7 7.6 6.2 6.8 6.2 5.8C6.2 4.8 7 4 8 4ZM11 8.5H13.8V9.9H13.85C14.25 9.15 15.2 8.35 16.7 8.35C19.8 8.35 20.4 10.4 20.4 13.1V19H17.4V14.3C17.4 13.2 17.38 11.75 15.85 11.75C14.3 11.75 14.05 12.95 14.05 14.2V19H11.05V8.5H11Z"
            fill="white"
          />
        </svg>
      );
    }

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        style={{ color }}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...restProps}
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
);

LinkedInIcon.displayName = 'LinkedInIcon';
