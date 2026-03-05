interface KeyTakeawaysProps {
  hook: string;
  sections: { heading: string }[];
}

export function KeyTakeaways({ hook, sections }: KeyTakeawaysProps) {
  if (sections.length === 0) return null;

  return (
    <div className="rounded-lg border-l-3 border-wealth-teal bg-wealth-teal/5 px-5 py-4">
      <h3 className="font-instrument text-lg text-deep-slate">Key Takeaways</h3>
      <p className="mt-2 text-deep-slate/75">{hook}</p>
      <ul className="mt-3 space-y-1.5">
        {sections.map((section, i) => (
          <li key={i} className="flex items-start gap-2 text-deep-slate/75">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal" />
            {section.heading}
          </li>
        ))}
      </ul>
    </div>
  );
}
