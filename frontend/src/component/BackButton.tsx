interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-tap-target min-w-tap-target self-start rounded-full border-2 border-border bg-surface px-md text-body font-semibold text-foreground hover:border-primary"
    >
      ← Back
    </button>
  );
}
