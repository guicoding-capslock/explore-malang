/**
 * Explore Malang — Main JS (Shared Utilities)
 * - Hamburger menu (.nav-open toggle, aria-expanded, outside-click close)
 * - Active nav link detection
 * - window.createDestinationCard(dest) — destination card HTML builder
 * - window.getQueryParam(param) — URL query string reader
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     DOM Ready helper
  ---------------------------------------------------------------- */
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /* ----------------------------------------------------------------
     2. Hamburger Menu
        - Toggles .nav-open on #nav-menu
        - Updates aria-expanded on #nav-hamburger
        - Closes on outside click or clicking a nav link
  ---------------------------------------------------------------- */
  function initHamburgerMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const navMenu   = document.getElementById('nav-menu');
    if (!hamburger || !navMenu) return;

    function openMenu() {
      navMenu.classList.add('nav-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Tutup menu navigasi');
      document.body.style.overflow = 'hidden'; // prevent scroll on mobile
    }

    function closeMenu() {
      navMenu.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Buka menu navigasi');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      const isOpen = navMenu.classList.contains('nav-open');
      isOpen ? closeMenu() : openMenu();
    }

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking a nav link
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close when clicking outside the nav
    document.addEventListener('click', function (e) {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        if (navMenu.classList.contains('nav-open')) {
          closeMenu();
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('nav-open')) {
        closeMenu();
        hamburger.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', closeMenu);
  }

  /* ----------------------------------------------------------------
     3. Active Nav Link Detection
        Matches href to current page pathname
  ---------------------------------------------------------------- */
  function initActiveNav() {
    const navLinks = document.querySelectorAll('.nav-link');
    if (!navLinks.length) return;

    const path     = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkFile = href.split('/').pop().split('?')[0];

      if (
        linkFile === filename ||
        (filename === 'destination.html' && linkFile === 'destinations.html') ||
        (filename === '' && linkFile === 'index.html') ||
        (filename === 'index.html' && linkFile === 'index.html')
      ) {
        link.classList.add('active');
        link.setAttribute('aria-current', filename === 'destination.html' ? 'true' : 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ----------------------------------------------------------------
     5. window.getQueryParam(param)
        Returns the value of a URL query parameter, or null.
  ---------------------------------------------------------------- */
  window.getQueryParam = function (param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  };

  window.escapeHTML = function (value) {
    return String(value ?? '').replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  };

  /* ----------------------------------------------------------------
     6. window.createDestinationCard(dest)
        Returns an HTML string for a destination card article.
  ---------------------------------------------------------------- */
  window.createDestinationCard = function (dest) {
    return `<article class="destination-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft">
  <a href="destination.html?slug=${dest.slug}" class="card-image-link block overflow-hidden">
    <div class="card-image-wrapper relative aspect-[4/3] overflow-hidden bg-primary/10 [&_img]:size-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-105">
      <img src="${dest.image}" alt="${dest.name}" loading="lazy" width="800" height="600" onerror="this.onerror=null;this.src='assets/images/placeholder.svg'">
      <div class="card-category-badge absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">${dest.categoryLabel}</div>
    </div>
  </a>
  <div class="card-content flex flex-1 flex-col p-6">
    <div class="card-meta mb-3 flex items-center justify-between gap-2">
      <span class="card-region text-xs font-semibold tracking-wide text-secondary">${dest.regionLabel}</span>
    </div>
    <h3 class="card-title font-heading text-xl leading-snug font-bold tracking-tight text-primary"><a href="destination.html?slug=${dest.slug}">${dest.name}</a></h3>
    <p class="card-desc mt-3 mb-5 text-sm leading-relaxed text-muted">${dest.shortDescription}</p>
    <a href="destination.html?slug=${dest.slug}" class="btn-card-link mt-auto inline-flex min-h-11 items-center border-t border-primary/10 pt-4 text-sm font-bold text-primary transition hover:text-secondary" aria-label="Lihat detail ${dest.name}">Lihat detail <span class="ml-auto" aria-hidden="true"><iconify-icon icon="solar:arrow-right-up-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon></span></a>
  </div>
</article>`;
  };

  /* ----------------------------------------------------------------
     Init everything on DOM ready
  ---------------------------------------------------------------- */
  ready(function () {
    initHamburgerMenu();
    initActiveNav();
  });

})();
