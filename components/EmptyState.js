export default function EmptyState({ title, description }) {
  return (
    <div className="ledger-card border-dashed p-10 text-center">
      <p className="font-display text-xl mb-1">{title}</p>
      {description && <p className="text-parchment/60 text-sm">{description}</p>}
    </div>
  );
}
