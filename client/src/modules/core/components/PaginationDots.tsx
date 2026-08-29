import React from 'react';

export interface PaginationDotsProps {
  total: number;
  current: number;
  onChange: (index: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  total,
  current,
  onChange,
  className = '',
  size = 'md',
}) => {
  if (total <= 1) return null;

  const sizeClasses = {
    sm: {
      wrapper: 'h-3.5 w-3.5 sm:h-4 sm:w-4',
      activeDot: 'h-1.5 w-1.5 sm:h-2 sm:w-2',
      inactiveDot: 'h-1 w-1 sm:h-1.5 sm:w-1.5',
    },
    md: {
      wrapper: 'h-3.5 w-3.5 sm:h-5 sm:w-5',
      activeDot: 'h-1.5 w-1.5 sm:h-2 sm:w-2',
      inactiveDot: 'h-1 w-1 sm:h-1.5 sm:w-1.5',
    },
    lg: {
      wrapper: 'h-4 w-4 sm:h-6 sm:w-6',
      activeDot: 'h-2 w-2 sm:h-2.5 sm:w-2.5',
      inactiveDot: 'h-1.5 w-1.5 sm:h-2 sm:w-2',
    },
  }[size];

  return (
    <div className={`flex items-center justify-center gap-1 sm:gap-2 select-none ${className}`}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        return (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(index);
            }}
            className="relative flex items-center justify-center focus:outline-none transition-all duration-300 cursor-pointer"
            aria-label={`Go to slide ${index + 1}`}
          >
            {isActive ? (
              <div
                className={`flex ${sizeClasses.wrapper} items-center justify-center rounded-full border border-[#D8B458] transition-all duration-300`}
              >
                <span
                  className={`${sizeClasses.activeDot} rounded-full bg-gradient-to-r from-[#F7E7B4] via-[#D8B458] to-[#B38728] shadow-xs`}
                />
              </div>
            ) : (
              <div className={`flex ${sizeClasses.wrapper} items-center justify-center`}>
                <span
                  className={`${sizeClasses.inactiveDot} rounded-full bg-zinc-400/80 hover:bg-zinc-600 transition-colors`}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PaginationDots;
