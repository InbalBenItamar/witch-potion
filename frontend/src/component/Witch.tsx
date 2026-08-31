export type WitchState = "waiting" | "brewing" | "presenting";

const EMOJI: Record<WitchState, string> = {
  waiting: "🧙",
  brewing: "🧙‍♀️",
  presenting: "🧙‍♀️",
};

const LABEL: Record<WitchState, string> = {
  waiting: "The witch is waiting to hear your trouble.",
  brewing: "The witch is brewing your potion.",
  presenting: "The witch has your potion ready.",
};

export function Witch({ state }: { state: WitchState }) {
  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={LABEL[state]}
    >
      <span className="text-6xl" aria-hidden="true">
        {EMOJI[state]}
      </span>
      {state === "brewing" && (
        <span className="text-body text-muted" aria-hidden="true">
          bubbling…
        </span>
      )}
    </div>
  );
}
