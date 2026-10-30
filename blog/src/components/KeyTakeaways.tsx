import { plainDashes } from "@/lib/display";

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
    <section className="border-t-2 border-ink pt-5">
      <h2 className="text-[1.75rem] leading-tight">Key Takeaways</h2>
      <ul className="mt-5 space-y-4">
        {takeaways.map((takeaway, i) => (
          <li key={i} className="text-[1.125rem] font-medium leading-snug text-ink">
            {plainDashes(takeaway)}
          </li>
        ))}
      </ul>
    </section>
  );
}
