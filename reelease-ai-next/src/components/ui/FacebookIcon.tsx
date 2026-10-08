import React from 'react';
import { LucideProps } from 'lucide-react';

interface FacebookIconProps extends LucideProps {
  filled?: boolean;
}

export const FacebookIcon = React.forwardRef<SVGSVGElement, FacebookIconProps>(
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
          <circle cx="12" cy="12" r="12" fill="#1877F2" />
          <path
            d="M15.5 12H13.25V21H9.75V12H8V9H9.75V7.25C9.75 5.5 10.75 4 13.5 4C14.75 4 15.75 4.15 15.75 4.15V7.15H14.25C13 7.15 12.75 7.75 12.75 8.5V9H15.5L15.5 12Z"
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
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
);

FacebookIcon.displayName = 'FacebookIcon';
