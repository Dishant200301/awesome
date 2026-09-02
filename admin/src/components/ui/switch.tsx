import React from 'react';

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onCheckedChange,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className = ''
}) => {
  const switchId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleToggle = () => {
    if (disabled) return;
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (onChange) {
      onChange(e);
    }
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  // Dimensions based on size
  const dimensions = {
    sm: {
      container: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      untranslate: 'translate-x-0.5'
    },
    md: {
      container: 'w-11 h-6',
      thumb: 'w-4.5 h-4.5',
      translate: 'translate-x-5.5',
      untranslate: 'translate-x-0.75'
    },
    lg: {
      container: 'w-14 h-7.5',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
      untranslate: 'translate-x-0.75'
    }
  }[size];

  const toggleElement = (
    <div
      onClick={handleToggle}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 ${
        dimensions.container
      } ${
        checked ? 'bg-neutral-950' : 'bg-neutral-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <input
        type="checkbox"
        id={switchId}
        checked={checked}
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
          dimensions.thumb
        } ${checked ? dimensions.translate : dimensions.untranslate}`}
      />
    </div>
  );

  if (!label && !description) {
    return toggleElement;
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {toggleElement}
      <div className="flex flex-col cursor-pointer" onClick={handleToggle}>
        {label && (
          <label
            htmlFor={switchId}
            className={`text-xs font-semibold cursor-pointer ${
              disabled ? 'text-neutral-400' : 'text-neutral-800'
            }`}
          >
            {label}
          </label>
        )}
        {description && (
          <span className="text-[11px] text-neutral-500 font-normal">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

export default Switch;
