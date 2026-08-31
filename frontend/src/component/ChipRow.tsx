import { CHIP } from "../data/chip";

interface ChipRowProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

export function ChipRow({ onSelect, disabled }: ChipRowProps) {
  return (
    <div
      className="flex flex-wrap gap-sm"
      role="group"
      aria-label="Suggested troubles"
    >
      {CHIP.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="min-h-tap-target rounded-full border-2 border-border bg-surface px-md text-body text-foreground hover:border-primary disabled:opacity-60"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
