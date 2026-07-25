/** Canonical public prompt URL: /profile/{username}/prompt/{promptId} */
export function promptDetailPath(username: string, promptId: string): string {
  return `/profile/${encodeURIComponent(username)}/prompt/${promptId}`;
}

/** Owner edit URL: /profile/{username}/prompt/{promptId}/edit */
export function promptEditPath(username: string, promptId: string): string {
  return `/profile/${encodeURIComponent(username)}/prompt/${promptId}/edit`;
}

/** Legacy URL without /prompt/ segment (for redirects). */
export function legacyPromptDetailPath(
  username: string,
  promptId: string,
): string {
  return `/profile/${encodeURIComponent(username)}/${promptId}`;
}
