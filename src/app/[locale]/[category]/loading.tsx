export default function CategoryLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 animate-pulse">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-muted/30" />
        <div>
          <div className="h-8 w-48 rounded bg-muted/30 mb-1" />
          <div className="h-4 w-72 rounded bg-muted/20" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
