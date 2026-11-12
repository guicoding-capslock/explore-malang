// destinations.js — Catalog page logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const categoryFilter = document.getElementById('category-filter');
  const regionFilter = document.getElementById('region-filter');
  const resetBtn = document.getElementById('reset-filters');
  const emptyReset = document.getElementById('empty-reset');
  const grid = document.getElementById('destinations-grid');
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');

  // Read URL params to pre-fill filters (deep-link from homepage category cards)
  const urlCategory = window.getQueryParam('category') || '';
  const urlRegion = window.getQueryParam('region') || '';
  if (urlCategory) categoryFilter.value = urlCategory;
  if (urlRegion) regionFilter.value = urlRegion;

  function filterAndRender() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const region = regionFilter.value;

    const filtered = window.DESTINATIONS.filter(dest => {
      const matchName =
        dest.name.toLowerCase().includes(query) ||
        dest.shortDescription.toLowerCase().includes(query);
      const matchCategory = !category || dest.category === category;
      const matchRegion = !region || dest.region === region;
      return matchName && matchCategory && matchRegion;
    });

    // Show/hide clear button
    searchClear.style.display = query ? 'block' : 'none';

    // Update result count
    const total = filtered.length;
    resultCount.textContent =
      total === 0
        ? 'Tidak ada hasil'
        : `Menampilkan ${total} destinasi`;

    // Render cards or empty state
    if (total === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';
      grid.innerHTML = filtered
        .map(dest => window.createDestinationCard(dest))
        .join('');
    }
  }

  // ── Event listeners ────────────────────────────────────────────────────────

  // Live search
  searchInput.addEventListener('input', filterAndRender);

  // Clear search input
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    filterAndRender();
    searchInput.focus();
  });

  // Category & region dropdowns
  categoryFilter.addEventListener('change', filterAndRender);
  regionFilter.addEventListener('change', filterAndRender);

  // Reset all filters
  function resetAll() {
    searchInput.value = '';
    categoryFilter.value = '';
    regionFilter.value = '';
    filterAndRender();
  }
  resetBtn.addEventListener('click', resetAll);
  emptyReset.addEventListener('click', resetAll);

  // ── Initial render ─────────────────────────────────────────────────────────
  filterAndRender();
});
