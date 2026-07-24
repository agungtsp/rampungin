"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/pagination";
import { usePaginationNav } from "./PaginationShell";

type Props = {
  basePath: string;
  page: number;
  perPage: PageSize;
  total: number;
  params?: Record<string, string | undefined>;
};

function hrefFor(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
  perPage: number,
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "" && k !== "page" && k !== "perPage") sp.set(k, v);
  }
  if (perPage !== 10) sp.set("perPage", String(perPage));
  if (page > 1) sp.set("page", String(page));
  const q = sp.toString();
  return q ? `${basePath}?${q}` : basePath;
}

export function PaginationControls({
  basePath,
  page,
  perPage,
  total,
  params = {},
}: Props) {
  const router = useRouter();
  const nav = usePaginationNav();
  const [localPending, startLocalTransition] = useTransition();
  const pending = nav?.pending ?? localPending;

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const to = Math.min(safePage * perPage, total);

  function go(nextPage: number, nextPerPage: number = perPage) {
    const href = hrefFor(basePath, params, nextPage, nextPerPage);
    if (nav) {
      nav.navigate(href);
      return;
    }
    startLocalTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  const btn =
    "rounded-lg px-3 py-1.5 text-sm ring-1 ring-secondary/50 transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className={`mt-4 flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-secondary/50 sm:flex-row sm:items-center sm:justify-between ${
        pending ? "opacity-70" : ""
      }`}
      aria-busy={pending}
    >
      <p className="text-sm text-ink-muted">
        Menampilkan{" "}
        <span className="font-semibold text-ink">
          {from}–{to}
        </span>{" "}
        dari <span className="font-semibold text-ink">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <span>Per halaman</span>
          <select
            className="rounded-lg bg-soft px-2 py-1.5 text-sm text-ink outline-none ring-1 ring-secondary/50 focus:ring-primary"
            value={perPage}
            disabled={pending}
            onChange={(e) => go(1, Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`${btn} text-ink-muted hover:bg-soft`}
            disabled={pending || safePage <= 1}
            onClick={() => go(safePage - 1)}
          >
            Sebelumnya
          </button>
          <span className="px-2 text-sm tabular-nums text-ink-muted">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            className={`${btn} text-ink-muted hover:bg-soft`}
            disabled={pending || safePage >= totalPages}
            onClick={() => go(safePage + 1)}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}
