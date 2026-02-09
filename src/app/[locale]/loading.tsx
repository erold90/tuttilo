export default function HomeLoading() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="h-[280px] bg-muted/20" />
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted/20" />
          ))}
        </div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="h-8 w-48 rounded bg-muted/20 mx-auto mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/20" />
          ))}
        </div>
      </div>
    </div>
  );
}
