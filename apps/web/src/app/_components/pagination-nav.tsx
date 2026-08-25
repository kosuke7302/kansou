import Link from "next/link";

export function PaginationNav({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-center gap-2 pt-3 flex-wrap">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        className={`px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-indigo-300 ${
          page === 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        ← 前
      </Link>
      {pages.map((item, idx) =>
        item === "…" ? (
          <span key={`e${idx}`} className="text-gray-400 text-sm px-1">…</span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
              page === item ? "bg-indigo-600 text-white" : "border border-gray-200 hover:border-indigo-300"
            }`}
          >
            {item}
          </Link>
        )
      )}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        className={`px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-indigo-300 ${
          page === totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        次 →
      </Link>
    </div>
  );
}
