import Link from "next/link";

export function Pagination({ page, pages, query }: { page: number; pages: number; query: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (nextPage: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => value && params.set(key, value));
    params.set("page", String(nextPage));
    return `/gallery?${params.toString()}`;
  };
  return (
    <nav aria-label="Paginacja galerii" className="mt-12 flex items-center justify-center gap-4">
      {page > 1 ? <Link className="button-secondary" href={href(page - 1)}>Poprzednia</Link> : <span />}
      <span className="text-sm text-[var(--taupe)]">Strona {page} z {pages}</span>
      {page < pages ? <Link className="button-secondary" href={href(page + 1)}>Następna</Link> : <span />}
    </nav>
  );
}
