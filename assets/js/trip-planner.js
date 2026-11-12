document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('planner-form');
  const resetBtn = document.getElementById('reset-form-btn');
  const resultsPlaceholder = document.getElementById('results-placeholder');
  const resultsOutput = document.getElementById('results-output');

  // ---- VALIDATION ----
  function validateForm() {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input, .form-select, input[type=radio]').forEach(el => {
      el.classList.remove('error');
      el.removeAttribute('aria-invalid');
    });

    // Check travel interest
    const interest = document.getElementById('travel-interest').value;
    if (!interest) {
      document.getElementById('interest-error').textContent = 'Pilih jenis wisata yang kamu minati.';
      document.getElementById('travel-interest').classList.add('error');
      document.getElementById('travel-interest').setAttribute('aria-invalid', 'true');
      isValid = false;
    }

    // Check region
    const region = document.getElementById('preferred-region').value;
    if (!region) {
      document.getElementById('region-error').textContent = 'Pilih wilayah tujuanmu.';
      document.getElementById('preferred-region').classList.add('error');
      document.getElementById('preferred-region').setAttribute('aria-invalid', 'true');
      isValid = false;
    }

    // Check duration
    const duration = document.querySelector('input[name="duration"]:checked');
    if (!duration) {
      document.getElementById('duration-error').textContent = 'Pilih durasi perjalananmu.';
      document.querySelector('input[name=duration]').setAttribute('aria-invalid', 'true');
      isValid = false;
    }

    // Check companions
    const companions = document.querySelector('input[name="companions"]:checked');
    if (!companions) {
      document.getElementById('companions-error').textContent = 'Pilih dengan siapa kamu bepergian.';
      document.querySelector('input[name=companions]').setAttribute('aria-invalid', 'true');
      isValid = false;
    }

    if (!isValid) form.querySelector('[aria-invalid=true]').focus();
    return isValid;
  }

  // ---- RECOMMENDATION ALGORITHM ----
  function getRecommendations(prefs) {
    const destinations = window.DESTINATIONS || [];
    let results = destinations.filter(dest => {
      // Category filter (allow "all")
      const matchCategory = prefs.interest === 'all' || dest.category === prefs.interest;
      // Region filter (allow "all")
      const matchRegion = prefs.region === 'all' || dest.region === prefs.region;
      return matchCategory && matchRegion;
    });

    // Sort: boost by companions preference
    results = results.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      if (prefs.companions === 'family') {
        if (a.category === 'recreation') scoreA += 2;
        if (b.category === 'recreation') scoreB += 2;
      }
      if (prefs.companions === 'couple') {
        if (a.category === 'nature' || a.category === 'beaches') scoreA += 1;
        if (b.category === 'nature' || b.category === 'beaches') scoreB += 1;
      }
      if (prefs.companions === 'solo') {
        if (a.category === 'culture') scoreA += 1;
        if (b.category === 'culture') scoreB += 1;
      }
      return scoreB - scoreA;
    });

    // Limit: 1 day = 2–3 destinations, 2 days = 4–5, 3 days = all matching (up to 6)
    const limits = { '1': 3, '2': 5, '3': 6 };
    return results.slice(0, limits[prefs.duration] || 6);
  }

  // ---- RENDER RESULTS ----
  function renderResults(prefs, recommendations) {
    const name = document.getElementById('traveler-name').value.trim();
    const greeting = name ? `Hei, ${window.escapeHTML(name)}! ` : '';

    const companionLabels = {
      solo: 'Solo Traveler', couple: 'Couple', friends: 'Bersama Teman', family: 'Bersama Keluarga'
    };
    const categoryLabels = {
      nature: 'Nature & Adventure', beaches: 'Beaches', culture: 'Culture & Heritage',
      recreation: 'Family Recreation', all: 'Semua Kategori'
    };
    const regionLabels = {
      'kota-malang': 'Kota Malang', 'kota-batu': 'Kota Batu',
      'kabupaten-malang': 'Kabupaten Malang', all: 'Seluruh Malang Raya'
    };

    if (recommendations.length === 0) {
      resultsOutput.innerHTML = `
        <div class="results-header mb-6 rounded-2xl border border-primary/10 bg-white p-5 sm:p-7 [&_h3]:mb-3 [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:font-bold [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted">
          <h3>Hasil Rekomendasi</h3>
        </div>
        <div class="empty-state flex flex-col items-center justify-center gap-4 rounded-2xl border border-primary/10 bg-white px-6 py-16 text-center [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_p]:max-w-md [&_p]:text-muted">
          <div class="empty-icon text-4xl"><iconify-icon icon="solar:map-point-linear" width="1em" height="1em" class="inline-block size-[1em] shrink-0 align-[-0.125em]" aria-hidden="true"></iconify-icon></div>
          <h3>Tidak Ada Rekomendasi</h3>
          <p>Belum ada destinasi yang sesuai dengan kombinasi preferensimu. Coba pilih "Semua Wilayah" atau "Semua Jenis Wisata".</p>
        </div>
      `;
    } else {
      resultsOutput.innerHTML = `
        <div class="results-header mb-6 rounded-2xl border border-primary/10 bg-white p-5 sm:p-7 [&_h3]:mb-3 [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:font-bold [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted">
          <h3>Rekomendasi Untukmu</h3>
          <p>${greeting}Berdasarkan preferensimu (${categoryLabels[prefs.interest]}, ${regionLabels[prefs.region]}, ${prefs.duration} hari, ${companionLabels[prefs.companions]}), berikut destinasi yang kami rekomendasikan:</p>
          <div class="results-tags my-5 flex flex-wrap gap-2">
            <span class="result-tag rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">${categoryLabels[prefs.interest]}</span>
            <span class="result-tag rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">${regionLabels[prefs.region]}</span>
            <span class="result-tag rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">${prefs.duration} Hari</span>
            <span class="result-tag rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">${companionLabels[prefs.companions]}</span>
          </div>
          <p class="results-count font-semibold">${recommendations.length} destinasi ditemukan</p>
        </div>
        <div class="destinations-grid results-grid grid grid-cols-1 gap-5 xl:grid-cols-2">
          ${recommendations.map(window.createDestinationCard).join('')}
        </div>
        <div class="results-footer mt-8 rounded-2xl border border-primary/10 bg-white p-6 text-center [&_p]:mb-4 [&_p]:text-sm [&_p]:text-muted">
          <p>Ingin mengeksplorasi lebih banyak pilihan?</p>
          <a href="destinations.html" class="btn-outline inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/25 px-6 py-3 text-center text-sm font-bold text-primary transition hover:bg-primary/5">Lihat Semua Destinasi</a>
        </div>
      `;
    }

    // Show results, hide placeholder
    resultsPlaceholder.style.display = 'none';
    resultsOutput.style.display = 'block';
    
    // Show reset button
    resetBtn.style.display = 'inline-flex';
    
    // Scroll to results on mobile
    if (window.innerWidth < 768) {
      resultsOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---- FORM SUBMIT ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const prefs = {
      interest: document.getElementById('travel-interest').value,
      region: document.getElementById('preferred-region').value,
      duration: document.querySelector('input[name="duration"]:checked').value,
      companions: document.querySelector('input[name="companions"]:checked').value,
    };

    const recommendations = getRecommendations(prefs);
    renderResults(prefs, recommendations);
  });

  // ---- RESET ----
  resetBtn.addEventListener('click', () => {
    form.reset();
    resultsOutput.style.display = 'none';
    resultsPlaceholder.style.display = 'flex';
    resetBtn.style.display = 'none';
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.getElementById('travel-interest').focus();
  });
});
