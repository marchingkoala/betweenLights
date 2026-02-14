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