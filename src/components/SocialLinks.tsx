import type { SocialPlatform } from "@/lib/social";
import { filledSocials, type SocialLinksData } from "@/lib/social";

function Icon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  const cn = className ?? "h-5 w-5";
  switch (platform) {
    case "threads":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="currentColor" aria-hidden>
          <path d="M12 2.5c-4.8 0-8.2 3.1-8.2 8.1 0 4.6 2.9 7.9 7.5 7.9 1.9 0 3.5-.7 4.6-1.9v1.4c0 .3.2.5.5.5h1.7c.3 0 .5-.2.5-.5V9.2c0-3.9-2.3-6.7-6.6-6.7zm3.2 10.3c-.8 1.5-2.1 2.3-3.7 2.3-2.1 0-3.5-1.5-3.5-3.8 0-2.4 1.5-3.9 3.5-3.9 1.5 0 2.7.7 3.4 1.9.1-.9.5-1.4 1.3-1.4h.1c.3 0 .5.2.5.5v6.1c0 .9-.5 1.4-1.4 1.4-.7 0-1.2-.4-1.4-1.3.1.1.2.2.2.2zm-3.7-5.5c-1.4 0-2.3 1.1-2.3 2.8 0 1.6.9 2.6 2.3 2.6 1.3 0 2.3-1.1 2.3-2.9 0-1.5-.9-2.5-2.3-2.5z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="currentColor" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="currentColor" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186 31.247 31.247 0 000 12a31.247 31.247 0 00.502 5.814 3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136A31.247 31.247 0 0024 12a31.247 31.247 0 00-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
  }
}

const ACCENT: Record<SocialPlatform, string> = {
  threads: "hover:bg-stone-900 hover:text-white hover:border-stone-900",
  instagram:
    "hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-amber-400 hover:text-white hover:border-transparent",
  youtube: "hover:bg-red-600 hover:text-white hover:border-red-600",
  linkedin: "hover:bg-sky-700 hover:text-white hover:border-sky-700",
};

type Props = {
  profile: SocialLinksData;
  size?: "sm" | "md";
};

export function SocialLinks({ profile, size = "md" }: Props) {
  const links = filledSocials(profile);
  if (!links.length) return null;

  const pad = size === "sm" ? "p-2" : "p-2.5";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Media sosial">
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            aria-label={link.label}
            className={`inline-flex items-center justify-center rounded-full border border-blue-900/15 bg-white text-blue-900 shadow-sm transition ${pad} ${ACCENT[link.key]}`}
          >
            <Icon platform={link.key} className={icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
