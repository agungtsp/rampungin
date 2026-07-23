import Link from "next/link";

type Props = {
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
};

export function ProfileCard({
  username,
  displayName,
  bio,
  avatarUrl,
}: Props) {
  const initial = (displayName || username).slice(0, 1).toUpperCase();

  return (
    <Link
      href={`/profile/${username}`}
      className="card-hover group flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-card-hover hover:ring-accent/25"
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-zinc-200"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent font-display text-xl font-bold text-white">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-zinc-900 group-hover:text-accent">
          {displayName || username}
        </h3>
        <p className="truncate text-sm text-zinc-500">@{username}</p>
        {bio ? (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{bio}</p>
        ) : (
          <p className="mt-1 text-sm text-zinc-400">Belum ada bio</p>
        )}
      </div>
    </Link>
  );
}
