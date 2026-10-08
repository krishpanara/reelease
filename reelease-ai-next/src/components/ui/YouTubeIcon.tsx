import React from 'react';
import { LucideProps } from 'lucide-react';

interface YouTubeIconProps extends LucideProps {
  filled?: boolean;
}

export const YouTubeIcon = React.forwardRef<SVGSVGElement, YouTubeIconProps>(
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
          <rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#FF0000" />
          <path d="M10 9l6 3-6 3V9z" fill="white" />
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
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    );
  }
);

YouTubeIcon.displayName = 'YouTubeIcon';
