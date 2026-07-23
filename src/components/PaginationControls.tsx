"use client";

import Link from "next/link";
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/pagination";

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
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const to = Math.min(safePage * perPage, total);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-zinc-200 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-500">
        Menampilkan{" "}
        <span className="font-semibold text-zinc-900">
          {from}–{to}
        </span>{" "}
        dari <span className="font-semibold text-zinc-900">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Per halaman</span>
          <select
            className="rounded-lg bg-zinc-50 px-2 py-1.5 text-sm text-zinc-900 outline-none ring-1 ring-zinc-200 focus:ring-accent"
            defaultValue={perPage}
            onChange={(e) => {
              const next = Number(e.target.value);
              window.location.href = hrefFor(basePath, params, 1, next);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          {safePage <= 1 ? (
            <span className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 ring-1 ring-zinc-100">
              Sebelumnya
            </span>
          ) : (
            <Link
              href={hrefFor(basePath, params, safePage - 1, perPage)}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              Sebelumnya
            </Link>
          )}
          <span className="px-2 text-sm tabular-nums text-zinc-500">
            {safePage} / {totalPages}
          </span>
          {safePage >= totalPages ? (
            <span className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 ring-1 ring-zinc-100">
              Berikutnya
            </span>
          ) : (
            <Link
              href={hrefFor(basePath, params, safePage + 1, perPage)}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              Berikutnya
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
