"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  followingId: string;
  initiallyFollowing: boolean;
  isLoggedIn: boolean;
  isSelf: boolean;
};

export function FollowButton({
  followingId,
  initiallyFollowing,
  isLoggedIn,
  isSelf,
}: Props) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [busy, setBusy] = useState(false);

  if (isSelf) return null;

  async function toggle() {
    if (!isLoggedIn) {
      window.location.href = `/auth?next=/profile`;
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
      className="rounded-full bg-blue-800 px-4 py-2 text-sm text-white disabled:opacity-60"
    >
      {following ? "Mengikuti" : "Ikuti"}
    </button>
  );
}
