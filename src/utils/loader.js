const modules = import.meta.glob('/sims/**/*.jsx');

function formatName(slug) {
  return slug
    .replace(/[_-]/g, ' ')
    .replace(/\//g, ' / ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getSimulations() {
  return Object.entries(modules).map(([path, loader]) => {
    const relativePath = path.replace('/sims/', '');
    const parts = relativePath.replace('.jsx', '').split('/');
    const fileName = parts[parts.length - 1];
    const category =
      parts.length > 1 ? parts.slice(0, -1).join('/') : 'uncategorized';
    const slug = relativePath.replace('.jsx', '');

    return {
      path,
      slug,
      name: formatName(fileName),
      category: formatName(category),
      categorySlug: category,
      loader,
    };
  });
}

export function getCategories() {
  const sims = getSimulations();
  const categories = {};

  sims.forEach((sim) => {
    if (!categories[sim.categorySlug]) {
      categories[sim.categorySlug] = {
        name: sim.category,
        slug: sim.categorySlug,
        count: 0,
      };
    }
    categories[sim.categorySlug].count++;
  });

  return Object.values(categories);
}

export function getSimulation(slug) {
  const sims = getSimulations();
  return sims.find((s) => s.slug === slug) || null;
}
