export interface Step {
  text: string;
  ingredient: string[];
}

export interface Potion {
  name: string;
  ingredient: string[];
  step: Step[];
  closingLine: string;
}
