"use client";

interface ChipSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
}

export default function ChipSelect({
  options,
  selected,
  onChange,
  multi = false,
}: ChipSelectProps) {
  function toggle(option: string) {
    if (multi) {
      onChange(
        selected.includes(option)
          ? selected.filter((s) => s !== option)
          : [...selected, option],
      );
    } else {
      onChange([option]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-on-primary shadow-sm"
                : "border-border bg-surface-soft text-foreground/80 hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
