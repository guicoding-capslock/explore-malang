# Explore Malang 🌿

**Discover More, Experience Malang.**

Website pariwisata untuk menemukan destinasi wisata terbaik di Malang Raya — Kota Malang, Kota Batu, dan Kabupaten Malang.

Dibuat sebagai proyek UTS mata kuliah Pemrograman Web 1.

---

## Fitur Utama

- 🏠 **Homepage** — Hero carousel, kategori wisata, destinasi unggulan, dan inspirasi perjalanan
- 🗺️ **Destinations** — Katalog lengkap dengan search dan filter kategori & wilayah
- 📍 **Destination Detail** — Halaman detail dinamis berdasarkan URL slug
- 🧭 **Plan Your Trip** — Form perencanaan perjalanan dengan rekomendasi wisata

## Teknologi

- HTML5 Semantik
- Tailwind CSS v4 melalui Play CDN (`https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`)
- Design tokens melalui `@theme` dalam `<style type="text/tailwindcss">` pada setiap HTML
- Custom CSS terbatas untuk fallback gambar, state interaktif, print, dan reduced motion
- JavaScript Vanilla ES6+
- Google Fonts (Plus Jakarta Sans + DM Sans)
- Solar Linear dari Iconify melalui web component CDN (`iconify-icon@3.0.0`)

Tidak memakai Bootstrap, npm, Vite, PostCSS, atau proses build. Layout, typography, spacing, komponen, dan responsive design menggunakan utility Tailwind (`sm:`, `md:`, `lg:`, `xl:`).

**Play CDN ditujukan untuk development/prototyping**, sesuai kebutuhan proyek UTS ini. Konfigurasi ini bukan production-optimized. Tailwind, Google Fonts, Iconify, dan foto eksternal memerlukan koneksi internet. Lihat [dokumentasi resmi Play CDN](https://tailwindcss.com/docs/installation/play-cdn).

## Struktur Project

```
explore-malang/
├── index.html              # Halaman utama
├── destinations.html        # Katalog destinasi
├── destination.html         # Detail destinasi (dinamis)
├── trip-planner.html        # Form perencanaan perjalanan
├── assets/
│   ├── css/
│   │   └── style.css        # Efek khusus & aksesibilitas; layout di utility HTML
│   ├── js/
│   │   ├── destinations-data.js  # Data destinasi wisata
│   │   ├── main.js               # Shared utilities & navigasi
│   │   ├── index.js              # Logic homepage & carousel
│   │   ├── destinations.js       # Logic katalog & filter
│   │   ├── destination.js        # Logic halaman detail
│   │   └── trip-planner.js       # Logic form & rekomendasi
│   └── images/
│       └── placeholder.svg       # Fallback gambar
├── tests/
│   └── check-site.mjs       # Pemeriksaan statis & regresi JavaScript tanpa dependency
└── README.md
```

## Cara Menjalankan Secara Lokal

Karena website ini bersifat statis (tidak memerlukan backend atau build tools), kamu bisa menjalankannya dengan beberapa cara:

### Metode 1 — VS Code Live Server (Direkomendasikan)
1. Install ekstensi [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) di VS Code
2. Buka folder `explore-malang` di VS Code
3. Klik kanan pada `index.html` → pilih **"Open with Live Server"**
4. Browser akan membuka `http://127.0.0.1:5500/index.html`

### Metode 2 — Python HTTP Server
```bash
# Di dalam folder explore-malang:
python3 -m http.server 8000
# Buka http://localhost:8000
```

Gunakan HTTP server lokal untuk memeriksa perilaku yang sama dengan hosting statis.

## Pemeriksaan

```bash
node tests/check-site.mjs
```

Pemeriksaan ini menggunakan modul bawaan Node.js, tanpa instalasi paket atau build. Mencakup kesamaan CDN dan theme di empat halaman, markup Solar, foto destinasi, tautan lokal, renderer card, carousel, navigasi, filter, detail, serta validasi dan hasil formulir. Tetap lakukan pemeriksaan visual di browser pada mobile, tablet, dan desktop saat koneksi CDN tersedia.

## Deployment ke GitHub Pages

### Langkah-langkah:

1. **Buat repository baru** di GitHub (misalnya: `explore-malang`)

2. **Push project ke GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: Explore Malang website"
git branch -M main
git remote add origin https://github.com/[username]/explore-malang.git
git push -u origin main
```

3. **Aktifkan GitHub Pages:**
   - Buka repository di GitHub
   - Pergi ke **Settings → Pages**
   - Di bagian **Source**, pilih branch `main` dan folder `/ (root)`
   - Klik **Save**

4. **Akses website:**
   - Website tersedia di: `https://[username].github.io/explore-malang/`
   - Proses deployment biasanya membutuhkan 1-3 menit

> ✅ Website ini kompatibel penuh dengan GitHub Pages karena:
> - Menggunakan relative paths untuk semua link dan aset
> - Tidak memerlukan backend/server-side processing
> - Tidak menggunakan routing yang bergantung pada server

## Checklist Ketentuan UTS

- [x] Tema: Pemasaran/Promosi Wisata
- [x] Minimal 4 file HTML berbeda yang saling terhubung
- [x] Minimal 1 file HTML memuat formulir yang relevan (`trip-planner.html`)
- [x] Komponen carousel (di `index.html`, berfungsi dengan JavaScript)
- [x] Komponen card (destination cards di semua halaman)
- [x] Navigation menu (di semua halaman, responsif)
- [x] Website responsif (mobile, tablet, desktop)
- [x] Konten relevan dengan tema (tidak ada Lorem Ipsum)
- [x] Kompatibel dengan hosting statis (GitHub Pages)
- [x] Struktur siap dipublikasikan melalui URL publik (deployment dilakukan terpisah)

## Halaman & Fitur JavaScript

| Halaman | File JS | Fitur |
|---------|---------|-------|
| index.html | index.js | Hero carousel (otomatis + manual), tampil destinasi unggulan dari data |
| destinations.html | destinations.js | Search real-time, filter kategori, filter wilayah, reset filter, URL param pre-filter |
| destination.html | destination.js | Render dinamis dari URL slug, fallback not-found, destinasi terkait |
| trip-planner.html | trip-planner.js | Validasi form, algoritma rekomendasi berdasarkan preferensi, tampil hasil |

## Aset Visual

Foto destinasi dimuat dari internet dan ikon menggunakan Solar dari Iconify. Jika foto gagal dimuat, ilustrasi lokal `assets/images/placeholder.svg` akan tampil. Keduanya memerlukan koneksi internet saat halaman dibuka.

## Destinasi yang Tersedia

| # | Destinasi | Wilayah | Kategori |
|---|-----------|---------|---------|
| 1 | Kampung Warna-Warni Jodipan | Kota Malang | Culture & Heritage |
| 2 | Kampoeng Heritage Kajoetangan | Kota Malang | Culture & Heritage |
| 3 | Museum Angkut | Kota Batu | Family Recreation |
| 4 | Coban Rondo | Kabupaten Malang | Nature & Adventure |
| 5 | Pantai Balekambang | Kabupaten Malang | Beaches |
| 6 | Jatim Park 1 | Kota Batu | Family Recreation |
| 7 | Batu Secret Zoo | Kota Batu | Family Recreation |
| 8 | Coban Pelangi | Kabupaten Malang | Nature & Adventure |
| 9 | Pantai Sendang Biru | Kabupaten Malang | Beaches |
| 10 | Alun-Alun Batu | Kota Batu | Family Recreation |

---

*Dibuat dengan ❤️ untuk UTS Pemrograman Web 1*
