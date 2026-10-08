import React from 'react';
import { LucideProps } from 'lucide-react';

interface InstagramIconProps extends LucideProps {
  filled?: boolean;
}

export const InstagramIcon = React.forwardRef<SVGSVGElement, InstagramIconProps>(
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
          <defs>
            <linearGradient id="instagram-grad-fill" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFB700" />
              <stop offset="50%" stopColor="#FF006B" />
              <stop offset="100%" stopColor="#AD00FF" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="5" fill="url(#instagram-grad-fill)" />
          <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="15.5" cy="8.5" r="0.8" fill="white" />
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
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }
);

InstagramIcon.displayName = 'InstagramIcon';
