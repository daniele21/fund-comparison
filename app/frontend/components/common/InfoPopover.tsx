import React from 'react';
import { Info } from 'lucide-react';

interface InfoPopoverProps {
  label: string;
  title: string;
  children: React.ReactNode;
  linkHref?: string;
  linkLabel?: string;
  className?: string;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({
  label,
  title,
  children,
  linkHref,
  linkLabel = 'Apri approfondimento',
  className = '',
}) => {
  const popoverId = React.useId();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handlePointerDown = (event: PointerEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  const stopPropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex ${className}`}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onPointerDown={stopPropagation}
      onMouseEnter={() => setIsOpen(true)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        aria-describedby={popoverId}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-7 min-h-0 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm transition hover:border-[rgb(var(--brand-primary-rgb)/0.45)] hover:text-[rgb(var(--brand-primary-rgb)/1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--brand-primary-rgb)/1)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        id={popoverId}
        role="tooltip"
        className={`absolute right-0 top-9 z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs normal-case leading-relaxed text-slate-600 shadow-xl transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        <strong className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</strong>
        <span className="mt-1 block">{children}</span>
        {linkHref && (
          <a
            href={linkHref}
            className="mt-2 inline-flex min-h-0 items-center text-xs font-semibold text-[rgb(var(--brand-primary-rgb)/1)] underline underline-offset-4 hover:text-[rgb(var(--brand-primary-deep-rgb)/1)] dark:text-[rgb(var(--brand-accent-rgb)/1)]"
          >
            {linkLabel}
          </a>
        )}
      </span>
    </span>
  );
};

export default InfoPopover;
