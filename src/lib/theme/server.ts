import { cookies } from "next/headers";
import { DEFAULT_THEME, THEME_COOKIE, parseTheme, type Theme } from "./index";

export async function getServerTheme(): Promise<Theme> {
  try {
    const jar = await cookies();
    return parseTheme(jar.get(THEME_COOKIE)?.value);
  } catch {
    return DEFAULT_THEME;
  }
}
