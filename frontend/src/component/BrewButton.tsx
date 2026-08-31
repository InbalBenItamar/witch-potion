interface BrewButtonProps {
  onClick: () => void;
  disabled: boolean;
  brewing: boolean;
}

export function BrewButton({ onClick, disabled, brewing }: BrewButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-tap-target min-w-tap-target rounded-full bg-primary px-xl text-body font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
    >
      {brewing ? "Brewing…" : "Brew"}
    </button>
  );
}
