"use client";

import {
  ChartBar,
  ChartLineUp,
  Code,
  FilmStrip,
  GraduationCap,
  Lightning,
  Megaphone,
  Palette,
  PencilSimple,
  PuzzlePiece,
  SquaresFour,
  type Icon,
} from "@phosphor-icons/react";
import type { CategoryIconName } from "@/lib/categories";

const MAP: Record<CategoryIconName, Icon> = {
  "squares-four": SquaresFour,
  megaphone: Megaphone,
  code: Code,
  "pencil-simple": PencilSimple,
  palette: Palette,
  "chart-line-up": ChartLineUp,
  "graduation-cap": GraduationCap,
  lightning: Lightning,
  "chart-bar": ChartBar,
  "film-strip": FilmStrip,
  "puzzle-piece": PuzzlePiece,
};

export function CategoryIcon({
  name,
  className,
  size = 16,
}: {
  name: CategoryIconName;
  className?: string;
  size?: number;
}) {
  const Cmp = MAP[name] ?? PuzzlePiece;
  return (
    <Cmp
      className={className}
      size={size}
      weight="regular"
      aria-hidden
    />
  );
}
