export default function PostLoading() {
  return (
    <>
      <div className="plate" aria-hidden="true" />
      <div className="sheet sheet-over">
        <div className="animate-pulse lg:grid lg:grid-cols-[13rem_minmax(0,68ch)] lg:gap-16" aria-hidden="true">
          <div className="hidden space-y-3 lg:block">
            <div className="h-3 w-20 bg-rule" />
            <div className="h-3 w-full bg-rule" />
            <div className="h-3 w-5/6 bg-rule" />
            <div className="h-3 w-4/6 bg-rule" />
          </div>
          <div className="space-y-3">
            <div className="h-5 w-full bg-rule" />
            <div className="h-5 w-full bg-rule" />
            <div className="h-5 w-5/6 bg-rule" />
            <div className="h-5 w-3/4 bg-rule" />
          </div>
        </div>
      </div>
    </>
  );
}
