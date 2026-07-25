"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Link that prefixes the current locale (`/id` or `/en`). */
export function LocaleLink({ href, ...props }: Props) {
  const { locale } = useLocale();
  const localized =
    href.startsWith("http") || href.startsWith("#")
      ? href
      : localePath(locale, href);
  return <Link href={localized} {...props} />;
}
