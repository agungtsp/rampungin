export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-3 py-8 sm:px-6">
      <div className="mx-auto h-24 max-w-xl animate-pulse rounded-2xl bg-soft" />
      <div className="marketplace-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-xl bg-soft"
          />
        ))}
      </div>
    </main>
  );
}
