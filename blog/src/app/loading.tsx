import { ListSkeleton, ShoutSkeleton } from "@/components/ListSkeleton";

export default function HomeLoading() {
  return (
    <main>
      <div className="px-[var(--gutter)] pb-10 pt-6 md:pt-10">
        <ShoutSkeleton />
      </div>
      <div className="plate" aria-hidden="true" />
      <div className="sheet sheet-over">
        <ListSkeleton />
      </div>
    </main>
  );
}
