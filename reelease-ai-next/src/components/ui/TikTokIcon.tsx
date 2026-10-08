import React from 'react';
import { LucideProps } from 'lucide-react';

interface TikTokIconProps extends LucideProps {
  filled?: boolean;
}

export const TikTokIcon = React.forwardRef<SVGSVGElement, TikTokIconProps>(
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
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path
            d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
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
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    );
  }
);

TikTokIcon.displayName = 'TikTokIcon';
