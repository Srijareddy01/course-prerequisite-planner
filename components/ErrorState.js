export default function ErrorState({ message }) {
  return (
    <div className="ledger-card border-rust/50 p-8 text-center">
      <p className="eyebrow text-rust mb-2">Connection problem</p>
      <p className="font-display text-lg mb-1">Couldn&apos;t reach the database</p>
      <p className="text-parchment/60 text-sm max-w-md mx-auto">
        {message || 'CognoDB is unreachable right now. Check that your instance is running and your connection details are correct, then try again.'}
      </p>
    </div>
  );
}
