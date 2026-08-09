"use client";

/**
 * The furniture.
 *
 * Chunky, square-cornered, hard-shadowed: the visual grammar of a console game
 * from before rounded corners were invented, which happens to be exactly the
 * grammar a five year old reads as "press me". Nothing here is clever; it is
 * just consistent, and consistency is what stops a game made of pixel
 * characters from sitting inside a settings sheet made of something else.
 */

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "plain" | "bright" | "quiet";
  size?: "sm" | "md" | "lg";
}

const TONES: Record<string, string> = {
  plain: "bg-white text-neutral-900 dark:bg-neutral-100",
  bright: "bg-amber-300 text-neutral-900",
  quiet: "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
};

const SIZES: Record<string, string> = {
  sm: "px-2.5 py-1.5 text-[10px]",
  md: "px-3.5 py-2.5 text-xs",
  lg: "px-4 py-3 text-sm",
};

export function PixelButton({
  tone = "plain",
  size = "md",
  className = "",
  ...rest
}: PixelButtonProps) {
  return (
    <button
      type="button"
      // The shadow moves under the button when you press it, which is the
      // cheapest possible way to make a rectangle feel like a key.
      className={`font-pixel inline-flex select-none items-center justify-center gap-1.5 uppercase leading-none tracking-[0.12em] transition-[transform,box-shadow] duration-75 active:translate-y-[3px] active:shadow-[0_0_0_3px_rgba(0,0,0,0.24)] disabled:pointer-events-none disabled:opacity-35 ${TONES[tone]} ${SIZES[size]} ${className}`}
      style={{ boxShadow: "0 3px 0 0 rgba(0,0,0,0.24), 0 0 0 3px rgba(0,0,0,0.24)" }}
      {...rest}
    />
  );
}

/** A labelled row of choices. One of them is on; the rest are off. */
export function PixelChoice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-pixel text-[9px] uppercase tracking-[0.22em] opacity-50">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <PixelButton
            key={option.value}
            size="sm"
            tone={option.value === value ? "bright" : "quiet"}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </PixelButton>
        ))}
      </div>
    </div>
  );
}

/** A full-screen sheet. Everything that isn't the board lives in one of these. */
export function PixelSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="chess-rise flex max-h-[92vh] w-full max-w-md flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
        style={{ boxShadow: "0 0 0 4px rgba(0,0,0,0.3)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b-4 border-black/15 px-4 py-3">
          <h2 className="font-pixel text-sm uppercase tracking-[0.18em]">{title}</h2>
          <PixelButton size="sm" onClick={onClose} aria-label="Close">
            ✕
          </PixelButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
