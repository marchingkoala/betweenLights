export const norm = (s) => String(s ?? "").trim().toLowerCase();

/** Group must match applied shape (if any) and at least one applied color (if any). */
export function groupMatchesAppliedFilters(group, appliedColors, appliedShapes) {
  if (appliedShapes.size > 0) {
    const gShape = norm(group.shape);
    const shapeOk = [...appliedShapes].some((s) => norm(s) === gShape);
    if (!shapeOk) return false;
  }
  if (appliedColors.size > 0) {
    const groupColorsNorm = new Set((group.colors ?? []).map(norm));
    const colorOk = [...appliedColors].some((c) =>
      groupColorsNorm.has(norm(c))
    );
    if (!colorOk) return false;
  }
  return true;
}

export const FILTER_COLORS = [
  "Black",
  "Tortoise",
  "Crystal",
  "Silver",
  "Gold",
];

export const FILTER_SHAPES = [
  "Oval",
  "Rectangle",
  "Aviator",
  "Cat Eye",
  "square",
  "round",
];
