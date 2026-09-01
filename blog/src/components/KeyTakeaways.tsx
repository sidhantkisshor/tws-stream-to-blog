interface KeyTakeawaysProps {
  sections: { keyTakeaway?: string }[];
}

export function KeyTakeaways({ sections }: KeyTakeawaysProps) {
  const takeaways = sections
    .map((section) => section.keyTakeaway)
    .filter((t): t is string => typeof t === "string" && t.trim() !== "")
    .map((t) => t.trim());

  if (takeaways.length === 0) return null;

  return (
    <div className="rounded-lg border-l-3 border-wealth-teal bg-wealth-teal/5 px-5 py-4">
      <h3 className="font-instrument text-lg text-deep-slate">Key Takeaways</h3>
      <ul className="mt-3 space-y-1.5">
        {takeaways.map((takeaway, i) => (
          <li key={i} className="flex items-start gap-2 text-deep-slate/75">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal" />
            {takeaway}
          </li>
        ))}
      </ul>
    </div>
  );
}
