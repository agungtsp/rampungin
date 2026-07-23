"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  followingId: string;
  profileUsername: string;
  initiallyFollowing: boolean;
  isLoggedIn: boolean;
  isSelf: boolean;
};

export function FollowButton({
  followingId,
  profileUsername,
  initiallyFollowing,
  isLoggedIn,
  isSelf,
}: Props) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [busy, setBusy] = useState(false);

  if (isSelf) return null;

  async function toggle() {
    if (!isLoggedIn) {
      const next = encodeURIComponent(`/profile/${profileUsername}`);
      window.location.href = `/auth?next=${next}`;
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    if (following) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", followingId);
      setFollowing(false);
    } else {
      await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: followingId,
      });
      setFollowing(true);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
    >
      {following ? "Mengikuti" : "Ikuti"}
    </button>
  );
}
