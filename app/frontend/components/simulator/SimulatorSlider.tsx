import React, { useState, useRef, useCallback } from 'react';

interface SimulatorSliderProps {
  /** Field label */
  label: string;
  /** Tooltip / help text */
  tooltip?: string;
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (v: number) => void;
  /** Min bound */
  min: number;
  /** Max bound */
  max: number;
  /** Step increment */
  step: number;
  /** Display formatter for the value badge */
  format: (v: number) => string;
  /** Formatter for min label (defaults to format) */
  formatMin?: (v: number) => string;
  /** Formatter for max label (defaults to format) */
  formatMax?: (v: number) => string;
  /** Optional suffix shown inside the inline input */
  inputSuffix?: string;
  /** Parse/format as thousands-separated Italian integers */
  useThousandsInput?: boolean;
  /** Text parser for thousands input */
  parseText?: (raw: string) => number;
  /** Text formatter for thousands input */
  formatText?: (v: number) => string;
  /** Accent color */
  accent?: 'blue' | 'emerald' | 'amber' | 'rose';
}

const ACCENT_COLORS: Record<string, { track: string; thumb: string; ring: string }> = {
  blue:    { track: 'var(--color-primary-500)', thumb: 'var(--color-primary-600)', ring: 'rgba(59,130,246,0.35)' },
  emerald: { track: '#10b981',                  thumb: '#059669',                  ring: 'rgba(16,185,129,0.35)' },
  amber:   { track: '#f59e0b',                  thumb: '#d97706',                  ring: 'rgba(245,158,11,0.35)' },
  rose:    { track: '#f43f5e',                  thumb: '#e11d48',                  ring: 'rgba(244,63,94,0.35)' },
};

const SimulatorSlider: React.FC<SimulatorSliderProps> = ({
  label,
  tooltip,
  value,
  onChange,
  min,
  max,
  step: stepVal,
  format,
  formatMin,
  formatMax,
  inputSuffix,
  useThousandsInput = false,
  parseText,
  formatText,
  accent = 'blue',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* ── Begin inline editing ──────────────────────────────── */
  const startEditing = useCallback(() => {
    setTextValue(useThousandsInput && formatText ? formatText(value) : String(value));
    setIsEditing(true);
    // Focus after React renders the input
    requestAnimationFrame(() => inputRef.current?.select());
  }, [value, useThousandsInput, formatText]);

  /* ── Commit & close ────────────────────────────────────── */
  const commitAndClose = useCallback(() => {
    if (useThousandsInput && parseText) {
      const parsed = parseText(textValue);
      const clamped = Math.max(min, Math.min(max * 5, parsed));
      onChange(clamped);
    } else {
      const parsed = Number(textValue);
      if (Number.isFinite(parsed)) {
        onChange(Math.max(min, Math.min(max * 5, parsed)));
      }
    }
    setIsEditing(false);
  }, [textValue, useThousandsInput, parseText, min, max, onChange]);

  /* Progress percentage for the filled track */
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const colors = ACCENT_COLORS[accent] || ACCENT_COLORS.blue;

  return (
    <div>
      {/* ── Header: label + editable value ── */}
      <div className="flex items-center justify-between gap-2 -mb-1">
        <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          {label}
          {tooltip && (
            <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
        </label>

        {/* Value: click to edit inline */}
        {isEditing ? (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onBlur={commitAndClose}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { commitAndClose(); (e.target as HTMLInputElement).blur(); }
                if (e.key === 'Escape') { setIsEditing(false); }
              }}
              className="w-24 sm:w-28 px-1.5 py-0 text-xs sm:text-sm text-right font-bold tabular-nums rounded border border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-800 ring-1 ring-blue-500/20 focus:outline-none"
              aria-label={`${label} – inserisci valore`}
            />
            {inputSuffix && (
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 pointer-events-none">
                {inputSuffix}
              </span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className={`
              text-xs sm:text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100
              px-1.5 py-0 rounded
              border border-transparent hover:border-slate-300 dark:hover:border-slate-600
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-all duration-150 cursor-text leading-snug
              ${isDragging ? 'scale-105' : ''}
            `}
            title="Clicca per digitare un valore"
            aria-label={`${label}: ${format(value)} – clicca per modificare`}
          >
            {format(value)}
          </button>
        )}
      </div>

      {/* ── Slider track ──────────────────────────────────────── */}
      <div className="relative group" ref={trackRef}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 pointer-events-none" />
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full pointer-events-none transition-[width] duration-75"
          style={{ width: `${clampedProgress}%`, background: colors.track }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={stepVal}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          className="simulator-slider relative w-full h-5 cursor-pointer z-10"
          style={{ '--slider-thumb-color': colors.thumb, '--slider-ring-color': colors.ring } as React.CSSProperties}
          aria-label={label}
        />
      </div>

      {/* ── Min / Max labels ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-0.5 -mt-1.5">
        <span className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums leading-none">
          {(formatMin || format)(min)}
        </span>
        <span className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums leading-none">
          {(formatMax || format)(max)}
        </span>
      </div>
    </div>
  );
};

export default SimulatorSlider;
