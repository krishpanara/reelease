import React from 'react';
import { LucideProps } from 'lucide-react';

interface XIconProps extends LucideProps {
  filled?: boolean;
}

export const XIcon = React.forwardRef<SVGSVGElement, XIconProps>(
  ({ className, color, size = 24, filled = false, ...props }, ref) => {
    // We omit lucide-specific stroke props to ensure the custom SVG renders correctly
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
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.922H5.078z"
              fill="white"
            />
          </g>
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
        style={{ color: color }}
        fill="currentColor"
        {...restProps}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.922H5.078z" />
      </svg>
    );
  }
);

XIcon.displayName = 'XIcon';
