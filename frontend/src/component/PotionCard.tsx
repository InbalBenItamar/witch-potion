import type { Potion } from "../type/potion";

export function PotionCard({ potion }: { potion: Potion }) {
  return (
    <article className="flex flex-col gap-md rounded-lg border-2 border-border bg-surface p-lg">
      <h2 className="text-title font-bold text-primary">{potion.name}</h2>

      <div>
        <h3 className="text-heading font-semibold">Ingredients</h3>
        <ul className="list-disc pl-lg text-body">
          {potion.ingredient.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-heading font-semibold">Steps</h3>
        <ol className="list-decimal pl-lg text-body">
          {potion.step.map((step) => (
            <li key={step.text}>{step.text}</li>
          ))}
        </ol>
      </div>

      <p className="text-body italic">{potion.closingLine}</p>

      <p className="text-body font-semibold text-danger">
        Not for eating or drinking — it&apos;s a potion, not a snack!
      </p>
    </article>
  );
}
