import { ListSkeleton, ShoutSkeleton } from "@/components/ListSkeleton";

export default function ArchiveLoading() {
  return (
    <main>
      <div className="px-[var(--gutter)] pb-10 pt-6 md:pt-10">
        <ShoutSkeleton />
      </div>
      <div className="sheet">
        <ListSkeleton />
      </div>
    </main>
  );
}
