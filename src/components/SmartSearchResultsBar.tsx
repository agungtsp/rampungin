"use client";

import Link from "next/link";
import { openSmartSearch } from "@/components/SmartSearchModal";

type Props = {
  note: string | null;
  query: string;
};

export function SmartSearchResultsBar({ note, query }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-accent-soft px-4 py-3 ring-1 ring-accent/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-sm font-medium text-zinc-900">
          Hasil untuk{" "}
          <span className="font-normal text-zinc-600">“{query}”</span>
        </p>
        {note ? <p className="text-sm text-accent-ink">{note}</p> : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openSmartSearch()}
          className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
        >
          Ubah
        </button>
        <Link
          href="/"
          className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800"
        >
          Reset
        </Link>
      </div>
    </div>
  );
}
