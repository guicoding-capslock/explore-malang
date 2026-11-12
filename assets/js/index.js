/**
 * index.js — Homepage-specific JavaScript
 * Explore Malang tourism website
 *
 * Responsibilities:
 *  1. Hero carousel (3 slides, prev/next, indicators, auto-advance, reduced-motion)
 *  2. Featured destinations injection from window.DESTINATIONS
 */

(function () {
  'use strict';

  /* =====================================================================
   * 1. HERO CAROUSEL
   * ===================================================================== */

  const carousel     = document.getElementById('hero-carousel');
  const slides       = carousel ? Array.from(carousel.querySelectorAll('.carousel-slide')) : [];
  const indicators   = carousel ? Array.from(carousel.querySelectorAll('.indicator')) : [];
  const prevBtn      = document.getElementById('carousel-prev');
  const nextBtn      = document.getElementById('carousel-next');
  const pauseBtn     = document.getElementById('carousel-pause');

  let currentIndex   = 0;
  let autoTimer      = null;
  let isPaused       = false;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Activate the slide at `index`, update indicators.
   * @param {number} index
   */
  function goToSlide(index) {
    if (!slides.length) return;
    // Clamp / wrap
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    // Deactivate all
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
      slide.inert = i !== index;
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    indicators.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-current', String(i === index));
    });

    currentIndex = index;
  }

  /** Start the auto-advance timer (5 s interval). */
  function startAutoPlay() {
    if (prefersReducedMotion || isPaused || slides.length < 2 || document.hidden ||
        carousel.matches(':hover') || carousel.contains(document.activeElement)) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(function () {
      goToSlide(currentIndex + 1);
    }, 5000);
  }

  /** Stop the auto-advance timer. */
  function stopAutoPlay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  if (pauseBtn) {
    pauseBtn.hidden = prefersReducedMotion;
    pauseBtn.addEventListener('click', function () {
      isPaused = !isPaused;
      pauseBtn.setAttribute('aria-pressed', String(isPaused));
      pauseBtn.innerHTML = `<iconify-icon icon="${isPaused ? 'solar:play-linear' : 'solar:pause-linear'}" width="1em" height="1em" class="inline-block size-[1em] shrink-0" aria-hidden="true"></iconify-icon> <span>${isPaused ? 'Putar slide' : 'Jeda slide'}</span>`;
      stopAutoPlay();
      startAutoPlay();
    });
  }

  // Wire up prev/next buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      goToSlide(currentIndex - 1);
      stopAutoPlay();
      startAutoPlay(); // restart timer after manual interaction
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      goToSlide(currentIndex + 1);
      stopAutoPlay();
      startAutoPlay();
    });
  }

  // Wire up indicator dots
  indicators.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(idx);
      stopAutoPlay();
      startAutoPlay();
    });
  });

  // Pause on hover, resume on leave
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Also pause on focus-within (keyboard users)
    carousel.addEventListener('focusin', stopAutoPlay);
    carousel.addEventListener('focusout', function () { setTimeout(startAutoPlay, 0); });
  }

  // Keyboard arrow navigation when carousel is focused
  document.addEventListener('keydown', function (e) {
    if (!carousel || !carousel.contains(document.activeElement)) return;
    if (e.key === 'ArrowLeft') {
      goToSlide(currentIndex - 1);
      stopAutoPlay();
      startAutoPlay();
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentIndex + 1);
      stopAutoPlay();
      startAutoPlay();
    }
  });

  // Kick off auto-play
  goToSlide(0);
  startAutoPlay();
  document.addEventListener('visibilitychange', function () {
    stopAutoPlay();
    startAutoPlay();
  });

  /* =====================================================================
   * 2. FEATURED DESTINATIONS
   * ===================================================================== */

  /**
   * Render featured destination cards into #featured-destinations.
   * Relies on:
   *   - window.DESTINATIONS  (from destinations-data.js)
   *   - window.createDestinationCard(dest)  (from main.js or destinations-data.js)
   */
  function renderFeaturedDestinations() {
    var container = document.getElementById('featured-destinations');
    if (!container) return;

    // Guard: data may not be loaded yet
    if (!window.DESTINATIONS || !Array.isArray(window.DESTINATIONS)) {
      console.warn('index.js: window.DESTINATIONS not available.');
      return;
    }

    if (typeof window.createDestinationCard !== 'function') {
      console.warn('index.js: window.createDestinationCard not available.');
      return;
    }

    var featured = window.DESTINATIONS
      .filter(function (dest) { return dest.featured === true; })
      .slice(0, 6);

    if (featured.length === 0) {
      container.innerHTML = '<p class="empty-state flex flex-col items-center justify-center gap-4 rounded-2xl border border-primary/10 bg-white px-6 py-16 text-center [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_p]:max-w-md [&_p]:text-muted">Belum ada destinasi unggulan.</p>';
      return;
    }

    container.innerHTML = featured.map(window.createDestinationCard).join('');
  }

  // Run after DOM is fully parsed (scripts are at bottom of body,
  // but guard with DOMContentLoaded for safety).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFeaturedDestinations);
  } else {
    renderFeaturedDestinations();
  }

})();
