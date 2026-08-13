export default function Loading() {
  return <div className="container-shell min-h-[75svh] pt-36" aria-live="polite"><div className="h-3 w-28 animate-pulse rounded bg-[var(--sand)]/25" /><div className="mt-6 h-20 max-w-3xl animate-pulse rounded bg-[var(--beige)]/10" /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-[var(--beige)]/6" />)}</div></div>;
}
