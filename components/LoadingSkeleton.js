export default function LoadingSkeleton({ rows = 6 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ledger-card p-4 animate-pulse">
          <div className="h-3 w-14 bg-brass/20 rounded mb-3" />
          <div className="h-5 w-3/4 bg-parchment/10 rounded mb-2" />
          <div className="h-3 w-1/2 bg-parchment/10 rounded" />
        </div>
      ))}
    </div>
  );
}
