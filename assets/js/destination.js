/**
 * destination.js — Detail page logic for Explore Malang
 * Reads ?slug=<slug> from the URL, finds the destination in
 * window.DESTINATIONS (from destinations-data.js), and renders
 * the full detail view into #detail-main.
 */

document.addEventListener('DOMContentLoaded', () => {
  const slug = window.getQueryParam('slug');
  const main = document.getElementById('detail-main');

  // Guard: no slug
  if (!slug) {
    renderNotFound(main, 'Slug destinasi tidak ditemukan.');
    return;
  }

  const dest = window.DESTINATIONS && window.DESTINATIONS.find(d => d.slug === slug);

  // Guard: slug not found in data
  if (!dest) {
    renderNotFound(main, `Destinasi dengan slug "${slug}" tidak ditemukan.`);
    return;
  }

  // Update page title
  document.title = `${dest.name} — Explore Malang`;
  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = `${dest.name} — Explore Malang`;

  // Render all sections
  main.innerHTML = `
    ${renderBreadcrumb(dest)}
    ${renderHero(dest)}
    ${renderContent(dest)}
    ${renderRelated(dest)}
  `;
});

/* =============================================
   NOT FOUND
   ============================================= */
function renderNotFound(main, msg) {
  main.innerHTML = `
    <section class="not-found-section section-padding flex min-h-[60vh] items-center py-14 md:py-20 lg:py-24">
      <div class="container mx-auto w-full max-w-7xl px-5 text-center sm:px-8 lg:px-12">
        <div class="mb-4 text-5xl" aria-hidden="true"><iconify-icon icon="solar:map-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon></div>
        <h1 class="font-heading text-3xl font-bold text-primary">
          Destinasi Tidak Ditemukan
        </h1>
        <p class="mt-4 mb-8 text-muted">${escapeHTML(msg)}</p>
        <a href="destinations.html" class="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-primary/90"><iconify-icon icon="solar:arrow-left-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon> Kembali ke Destinations</a>
      </div>
    </section>
  `;
}

/* =============================================
   BREADCRUMB
   ============================================= */
function renderBreadcrumb(dest) {
  return `
    <nav class="breadcrumb-nav border-b border-primary/10 py-5" aria-label="Breadcrumb">
      <div class="container mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <ol class="breadcrumb flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted [&_li+li]:before:mr-3 [&_li+li]:before:content-['/'] [&_a:hover]:text-primary [&_li:last-child]:text-primary">
          <li><a href="index.html">Home</a></li>
          <li><a href="destinations.html">Destinations</a></li>
          <li aria-current="page">${escapeHTML(dest.name)}</li>
        </ol>
      </div>
    </nav>
  `;
}

/* =============================================
   HERO
   ============================================= */
function renderHero(dest) {
  const image = dest.heroImage || dest.image || '';
  return `
    <section class="detail-hero relative isolate flex min-h-96 items-end bg-primary bg-cover bg-center md:min-h-[480px]" style="--destination-image:url('${image}')">
      <div class="detail-hero-overlay absolute inset-0 -z-10 bg-linear-to-t from-primary/95 via-primary/50 to-primary/15"></div>
      <div class="container detail-hero-content mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 py-12 md:py-16">
        <span class="hero-label mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">${escapeHTML(dest.regionLabel || '')}</span>
        <h1 class="detail-title max-w-4xl font-heading text-4xl leading-tight font-extrabold tracking-tight text-white md:text-6xl">${escapeHTML(dest.name)}</h1>
        <span class="category-badge mt-5 inline-block rounded-full bg-accent px-4 py-2 text-xs font-bold text-primary">${escapeHTML(dest.categoryLabel || '')}</span>
      </div>
    </section>
  `;
}

/* =============================================
   MAIN CONTENT
   ============================================= */
function renderContent(dest) {
  /* ---- Gallery ---- */
  const galleryHTML = dest.gallery && dest.gallery.length > 0 ? `
    <section class="detail-gallery section-padding-sm  py-10 md:py-14">
      <div class="container mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <h2 class="detail-section-title mb-5 font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">Galeri Foto</h2>
        <div class="gallery-grid grid grid-cols-1 gap-4 ${dest.gallery.length > 1 ? 'sm:grid-cols-2' : 'max-w-3xl'}">
          ${dest.gallery.map((url, i) => `
            <div class="gallery-item overflow-hidden rounded-2xl bg-sand [&_img]:aspect-[4/3] [&_img]:w-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-500 hover:[&_img]:scale-105">
              <img
                src="${url}"
                alt="${escapeHTML(dest.name)} - foto ${i + 1}"
                loading="lazy"
                onerror="this.onerror=null;this.src='assets/images/placeholder.svg'"
              >
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  /* ---- Highlights ---- */
  const highlightsHTML = dest.highlights && dest.highlights.length > 0 ? `
    <div class="detail-block mb-9">
      <h3 class="detail-block-title mb-4 font-heading text-lg font-bold text-primary"><iconify-icon icon="solar:star-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon> Daya Tarik Utama</h3>
      <ul class="highlight-list space-y-3 [&_li]:border-b [&_li]:border-primary/10 [&_li]:pb-3 [&_li]:text-sm [&_li]:leading-relaxed">
        ${dest.highlights.map(h => `<li>${escapeHTML(h)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  /* ---- Activities ---- */
  const activitiesHTML = dest.activities && dest.activities.length > 0 ? `
    <div class="detail-block mb-9">
      <h3 class="detail-block-title mb-4 font-heading text-lg font-bold text-primary"><iconify-icon icon="solar:compass-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon> Aktivitas</h3>
      <div class="activities-tags flex flex-wrap gap-2">
        ${dest.activities.map(a => `<span class="activity-tag rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">${escapeHTML(a)}</span>`).join('')}
      </div>
    </div>
  ` : '';

  /* ---- Tips ---- */
  const tipsHTML = dest.visitorTips && dest.visitorTips.length > 0 ? `
    <div class="detail-block tips-block mb-9 rounded-2xl border border-accent/35 bg-accent/10 p-6">
      <h3 class="detail-block-title mb-4 font-heading text-lg font-bold text-primary"><iconify-icon icon="solar:lightbulb-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon> Tips untuk Pengunjung</h3>
      <ul class="tips-list list-inside list-disc space-y-3 text-sm leading-relaxed text-muted">
        ${dest.visitorTips.map(t => `<li>${escapeHTML(t)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  /* ---- Address row ---- */
  const addressRow = dest.address ? `
    <div class="info-row flex justify-between gap-4 border-b border-primary/10 py-3 text-sm last:border-0">
      <span class="info-label shrink-0 text-muted">Alamat</span>
      <span class="info-value text-right font-medium">${escapeHTML(dest.address)}</span>
    </div>
  ` : '';

  /* ---- Maps button ---- */
  const mapsBtn = dest.mapsUrl ? `
    <a href="${dest.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary maps-btn inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-primary/90 mt-5 w-full">
      <iconify-icon icon="solar:map-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon> Buka di Google Maps
    </a>
  ` : '';

  return `
    ${galleryHTML}
    <section class="detail-content section-padding  py-14 md:py-20 lg:py-24">
      <div class="container mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div class="detail-layout grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">

          <!-- Main column -->
          <div class="detail-main-col min-w-0">
            <div class="detail-block mb-9">
              <h2 class="detail-section-title mb-5 font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">Tentang ${escapeHTML(dest.name)}</h2>
              <p class="detail-description text-base leading-loose text-muted md:text-lg">${escapeHTML(dest.description || '')}</p>
            </div>
            ${highlightsHTML}
            ${activitiesHTML}
          </div>

          <!-- Sidebar -->
          <aside class="detail-sidebar min-w-0 lg:sticky lg:top-28">
            <div class="detail-info-card mb-6 rounded-2xl border border-primary/10 bg-white p-6 shadow-soft">
              <h3 class="detail-block-title mb-4 font-heading text-lg font-bold text-primary"><iconify-icon icon="solar:map-point-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon> Informasi Lokasi</h3>
              <div class="info-row flex justify-between gap-4 border-b border-primary/10 py-3 text-sm last:border-0">
                <span class="info-label shrink-0 text-muted">Wilayah</span>
                <span class="info-value text-right font-medium">${escapeHTML(dest.regionLabel || '')}</span>
              </div>
              <div class="info-row flex justify-between gap-4 border-b border-primary/10 py-3 text-sm last:border-0">
                <span class="info-label shrink-0 text-muted">Kategori</span>
                <span class="info-value text-right font-medium">${escapeHTML(dest.categoryLabel || '')}</span>
              </div>
              ${addressRow}
              ${mapsBtn}
            </div>

            ${tipsHTML}

            <div class="detail-nav-links flex flex-col gap-3">
              <a href="destinations.html" class="btn-outline inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/25 px-6 py-3 text-center text-sm font-bold text-primary transition hover:bg-primary/5"><iconify-icon icon="solar:arrow-left-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon> Kembali ke Destinations</a>
              <a href="trip-planner.html" class="btn-secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/20 bg-white px-6 py-3 text-center text-sm font-bold text-primary transition hover:bg-ivory">Rencanakan Perjalanan</a>
            </div>
          </aside>

        </div>
      </div>
    </section>
  `;
}

/* =============================================
   RELATED DESTINATIONS
   ============================================= */
function renderRelated(dest) {
  if (!window.DESTINATIONS) return '';

  const related = window.DESTINATIONS
    .filter(d => d.slug !== dest.slug && (d.category === dest.category || d.region === dest.region))
    .slice(0, 3);

  if (related.length === 0) return '';

  const cardsHTML = related.map(window.createDestinationCard).join('');

  return `
    <section class="related-section section-padding bg-sand py-14 md:py-20 lg:py-24">
      <div class="container mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div class="section-header mb-8 max-w-2xl md:mb-10">
          <h2 class="section-title font-heading text-3xl leading-tight font-extrabold tracking-tight text-primary md:text-4xl">Destinasi Terkait</h2>
          <p class="section-desc mt-4 max-w-2xl text-base leading-relaxed text-muted">Destinasi lain yang mungkin kamu sukai.</p>
        </div>
        <div class="destinations-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          ${cardsHTML}
        </div>
      </div>
    </section>
  `;
}

