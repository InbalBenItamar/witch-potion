import { useEffect, useRef, useState } from "react";
import { BrewButton } from "./component/BrewButton";
import { ChipRow } from "./component/ChipRow";
import { PotionCard } from "./component/PotionCard";
import { TroubleBox } from "./component/TroubleBox";
import { Witch } from "./component/Witch";
import { brewPotion } from "./lib/brew";
import type { Potion } from "./type/potion";

type BrewState = "waiting" | "brewing" | "presenting";

export function App() {
  const [trouble, setTrouble] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [brewState, setBrewState] = useState<BrewState>("waiting");
  const [potion, setPotion] = useState<Potion | null>(null);

  const troubleRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  const handleTroubleChange = (value: string) => {
    setTrouble(value);
    if (error) setError(null);
  };

  const handleBrew = async () => {
    const trimmed = trouble.trim();
    if (trimmed === "") {
      setError("Tell the witch what is bothering you first.");
      return;
    }
    setError(null);
    setBrewState("brewing");
    const result = await brewPotion(trimmed);
    setPotion(result);
    setBrewState("presenting");
  };

  const handleBack = () => {
    setBrewState("waiting");
  };

  // Move focus to whatever the child should read next — the potion's name
  // on Brew, back to the trouble box on return — but not on first mount,
  // when brewState is already "waiting" and nothing has been read yet.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (brewState === "presenting") headingRef.current?.focus();
    if (brewState === "waiting") troubleRef.current?.focus();
  }, [brewState]);

  useEffect(() => {
    if (brewState !== "presenting") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [brewState]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-lg p-lg">
      <Witch state={brewState} />

      {brewState === "presenting" && potion ? (
        <PotionCard
          potion={potion}
          onBack={handleBack}
          headingRef={headingRef}
        />
      ) : (
        <>
          <TroubleBox
            value={trouble}
            onChange={handleTroubleChange}
            error={error}
            disabled={brewState === "brewing"}
            inputRef={troubleRef}
          />

          <ChipRow
            onSelect={handleTroubleChange}
            disabled={brewState === "brewing"}
          />

          <BrewButton
            onClick={handleBrew}
            disabled={brewState === "brewing"}
            brewing={brewState === "brewing"}
          />
        </>
      )}
    </main>
  );
}
