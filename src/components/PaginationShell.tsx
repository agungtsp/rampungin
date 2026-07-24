"use client";

import {
  createContext,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type NavCtx = {
  pending: boolean;
  navigate: (href: string) => void;
};

const PaginationNavContext = createContext<NavCtx | null>(null);

export function usePaginationNav() {
  return useContext(PaginationNavContext);
}

export function PaginationShell({
  content,
  skeleton,
  controls,
}: {
  content: ReactNode;
  skeleton: ReactNode;
  controls: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const value = useMemo<NavCtx>(
    () => ({
      pending,
      navigate: (href: string) => {
        startTransition(() => {
          router.push(href, { scroll: false });
        });
      },
    }),
    [pending, router],
  );

  return (
    <PaginationNavContext.Provider value={value}>
      <div aria-busy={pending} className="space-y-4">
        {pending ? skeleton : content}
      </div>
      {controls}
    </PaginationNavContext.Provider>
  );
}

export function PromptGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="marketplace-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse rounded-xl bg-soft"
        />
      ))}
    </div>
  );
}

export function ProfileListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl bg-soft ring-1 ring-secondary/40"
        />
      ))}
    </div>
  );
}
