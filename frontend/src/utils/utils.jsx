import { useEffect } from "react";
import { useLocation } from "react-router-dom";


export const groupProductsByStyle = (products) => {
  const map = new Map();

  products.forEach((p) => {
    // Use a stable key for "same style"
    // If name alone is enough, keep it simple:
    const key = `${p.category}__${p.name}`;

    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        key,
        colors: new Set([p.color]),
        variants: [p],
      });
      return;
    }

    existing.colors.add(p.color);
    existing.variants.push(p);
  });

  // Convert Set -> Array for rendering
  return Array.from(map.values()).map((group) => ({
    ...group,
    colors: Array.from(group.colors),
  }));
};

export function slugify(str = "") {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // use "smooth" if you prefer animation
    });
  }, [pathname]);

  return null;
};