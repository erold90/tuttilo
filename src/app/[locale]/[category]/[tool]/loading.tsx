export default function ToolLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 animate-pulse">
      <div className="h-4 w-48 rounded bg-muted/20 mb-4" />
      <div className="h-9 w-64 rounded bg-muted/30 mb-2" />
      <div className="h-4 w-96 rounded bg-muted/20 mb-8" />
      <div className="h-[400px] rounded-xl bg-muted/20" />
    </div>
  );
}
