import { useState } from "react";
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

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-lg p-lg">
      <Witch state={brewState} />

      <TroubleBox
        value={trouble}
        onChange={handleTroubleChange}
        error={error}
        disabled={brewState === "brewing"}
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

      {brewState === "presenting" && potion && <PotionCard potion={potion} />}
    </main>
  );
}
