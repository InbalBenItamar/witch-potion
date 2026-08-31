interface TroubleBoxProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  disabled: boolean;
}

export function TroubleBox({
  value,
  onChange,
  error,
  disabled,
}: TroubleBoxProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="trouble"
        className="text-heading font-semibold text-primary"
      >
        What is bothering you?
      </label>
      <textarea
        id="trouble"
        name="trouble"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder="Tell the witch..."
        className="min-h-tap-target rounded-lg border-2 border-border bg-surface p-md text-body text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
        aria-invalid={error != null}
        aria-describedby={error ? "trouble-error" : undefined}
      />
      {error && (
        <p id="trouble-error" role="alert" className="text-body text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
