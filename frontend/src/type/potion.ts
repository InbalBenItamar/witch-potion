export interface Step {
  text: string;
  ingredient: string[];
  verb: string;
}

export interface Potion {
  name: string;
  ingredient: string[];
  step: Step[];
  closingLine: string;
}

export interface BrewResponse {
  potion: Potion;
  generator: "offline" | "witch";
}
