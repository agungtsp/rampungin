/** Canonical public prompt URL: /profile/{username}/{promptId} */
export function promptDetailPath(username: string, promptId: string): string {
  return `/profile/${encodeURIComponent(username)}/${promptId}`;
}

/** Owner edit URL: /profile/{username}/{promptId}/edit */
export function promptEditPath(username: string, promptId: string): string {
  return `/profile/${encodeURIComponent(username)}/${promptId}/edit`;
}
