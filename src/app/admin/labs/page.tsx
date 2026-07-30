import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { localePath } from "@/lib/i18n/paths";
import { getServerLocale } from "@/lib/i18n/server";
import { whatsAppLink } from "@/lib/labs-phone";
import { isAdmin } from "@/lib/roles";
import { noIndexMetadata } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Submission = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  audience: string;
  problem: string;
  repeating_tasks: string;
  time_spent: string;
  expectations: string[];
  notes: string | null;
  locale: string;
  user_id: string | null;
  telegram_sent_at: string | null;
  telegram_error: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return noIndexMetadata(locale, "/admin/labs", "Labs leads");
}

export default async function AdminLabsPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `${localePath(locale, "/auth")}?next=${encodeURIComponent(localePath(locale, "/admin/labs"))}`,
    );
  }

  if (!(await isAdmin(supabase, user.id))) {
    notFound();
  }

  let rows: Submission[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("labs_submissions")
      .select(
        "id, created_at, name, email, phone, audience, problem, repeating_tasks, time_spent, expectations, notes, locale, user_id, telegram_sent_at, telegram_error",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    rows = (data as Submission[] | null) ?? [];
  } catch {
    rows = [];
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Admin
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Labs leads
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Newest first · WhatsApp + email ready
          </p>
        </div>
        <Link
          href={localePath(locale, "/labs")}
          className="text-sm font-medium text-primary-hover hover:underline"
        >
          View /labs →
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-panel px-5 py-8 text-center text-sm text-ink-muted ring-1 ring-secondary">
          No submissions yet. Apply the migration and submit from /labs.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((row) => {
            const wa = whatsAppLink(row.phone);
            return (
              <li
                key={row.id}
                className="rounded-2xl bg-panel p-5 shadow-card ring-1 ring-secondary"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {row.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {new Date(row.created_at).toLocaleString()} ·{" "}
                      {row.audience} · {row.time_spent} · {row.locale}
                      {row.user_id ? " · logged-in" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <a
                      href={`mailto:${row.email}`}
                      className="rounded-lg bg-soft px-2.5 py-1 text-ink-muted ring-1 ring-secondary hover:bg-secondary/40"
                    >
                      {row.email}
                    </a>
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                      >
                        WA {row.phone}
                      </a>
                    ) : (
                      <span className="rounded-lg bg-soft px-2.5 py-1 text-ink-muted ring-1 ring-secondary">
                        {row.phone}
                      </span>
                    )}
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-primary-hover">
                    Details
                  </summary>
                  <div className="mt-3 space-y-3 text-sm text-ink-muted">
                    <p>
                      <span className="font-semibold text-ink">Problem: </span>
                      {row.problem}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Repeating: </span>
                      {row.repeating_tasks}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">
                        Expectations:{" "}
                      </span>
                      {(row.expectations ?? []).join(", ")}
                    </p>
                    {row.notes ? (
                      <p>
                        <span className="font-semibold text-ink">Notes: </span>
                        {row.notes}
                      </p>
                    ) : null}
                    <p className="text-xs text-ink-faint">
                      Telegram:{" "}
                      {row.telegram_sent_at
                        ? `sent ${new Date(row.telegram_sent_at).toLocaleString()}`
                        : row.telegram_error
                          ? `error — ${row.telegram_error}`
                          : "pending / unknown"}
                    </p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
