export function FreeBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="hidden rounded-md bg-soft px-2 py-0.5 text-[11px] font-semibold text-primary md:inline-flex">
        Gratis
      </span>
    );
  }

  return (
    <p className="text-sm font-medium text-ink-muted">
      Gratis selamanya · share tanpa batas
    </p>
  );
}
