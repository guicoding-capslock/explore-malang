// Dependency-free regression checks; the small DOM fixture does not test rendering.
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const pages = ['index.html', 'destinations.html', 'destination.html', 'trip-planner.html'];
const cdn = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4';
const iconCdn = 'https://cdn.jsdelivr.net/npm/iconify-icon@3.0.0/dist/iconify-icon.min.js';
const theme = read(pages[0]).match(/<style type="text\/tailwindcss">([\s\S]*?)<\/style>/)[1];

function fixture(page, search = '', reducedMotion = false) {
  const elements = [];
  const listeners = new Map();
  let document;
  class Element {
    constructor(tag, attributes = {}) {
      this.tag = tag;
      this.attributes = attributes;
      this.value = attributes.value || '';
      this.innerHTML = '';
      this.textContent = '';
      this.style = {};
      this.checked = false;
      this.events = new Map();
      const classes = new Set((attributes.class || '').split(/\s+/));
      this.classList = {
        add: (name) => classes.add(name), remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name),
        toggle: (name, force = !classes.has(name)) => force ? classes.add(name) : classes.delete(name),
      };
    }
    addEventListener(type, callback) {
      this.events.set(type, [...(this.events.get(type) || []), callback]);
    }
    emit(type, event = {}) {
      for (const callback of this.events.get(type) || []) {
        callback({ target: this, preventDefault() {}, stopPropagation() {}, ...event });
      }
    }
    getAttribute(name) { return this.attributes[name] ?? null; }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    contains(element) { return element === this || this.querySelectorAll('*').includes(element); }
    querySelectorAll(selector) {
      // The fixtures only need descendants of these two existing components.
      const scope = this.attributes.id === 'hero-carousel'
        ? elements.filter(el => el.classList.contains('carousel-slide') || el.classList.contains('indicator') || el.classList.contains('carousel-btn') || el.attributes.id === 'carousel-pause')
        : this.attributes.id === 'nav-menu' ? elements.filter(el => el.classList.contains('nav-link'))
        : this.attributes.id === 'planner-form' ? elements.filter(el => ['input', 'select'].includes(el.tag))
        : [];
      return scope.filter(el => matches(el, selector));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    matches(selector) { return selector === ':hover' ? Boolean(this.hovered) : matches(this, selector); }
    focus() { document.activeElement = this; }
    scrollIntoView() { this.scrolled = true; }
    reset() { for (const el of this.querySelectorAll('*')) { el.value = el.attributes.value || ''; el.checked = false; } }
  }
  function matches(el, selector) {
    return selector.split(',').some(part => {
      part = part.trim();
      if (part === '*') return true;
      if (part.startsWith('.')) return el.classList.contains(part.slice(1));
      const tag = part.match(/^\w+/)?.[0];
      if (tag && el.tag !== tag) return false;
      for (const [, key, raw] of part.matchAll(/\[([^=\]]+)(?:=([^\]]+))?\]/g)) {
        if (!(key in el.attributes)) return false;
        if (raw && el.attributes[key] !== raw.replace(/["']/g, '')) return false;
      }
      return !part.endsWith(':checked') || el.checked;
    });
  }
  // Quoted attributes may contain '>' in Tailwind arbitrary variants.
  for (const [, tag, source] of read(page).matchAll(/<([a-z][\w-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)) {
    const attributes = Object.fromEntries([...source.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
    elements.push(new Element(tag, attributes));
  }
  const ids = elements.filter(el => el.attributes.id).map(el => el.attributes.id);
  assert.equal(new Set(ids).size, ids.length, `${page}: duplicate IDs`);
  document = {
    readyState: 'loading', hidden: false, title: '',
    body: elements.find(el => el.tag === 'body'),
    getElementById: id => elements.find(el => el.attributes.id === id) || null,
    querySelectorAll: selector => elements.filter(el => matches(el, selector)),
    querySelector: selector => elements.find(el => matches(el, selector)) || null,
    addEventListener(type, callback) { listeners.set(type, [...(listeners.get(type) || []), callback]); },
  };
  document.activeElement = document.body;
  const timers = new Map();
  const media = new Map();
  const context = vm.createContext({
    document, console, URLSearchParams,
    location: { pathname: `/explore-malang/${page}`, search }, innerWidth: 375,
    matchMedia(query) {
      if (!media.has(query)) media.set(query, Object.assign(new Element('media'), { matches: query.includes('reduced-motion') && reducedMotion }));
      return media.get(query);
    },
    setInterval(callback) { const id = Symbol(); timers.set(id, callback); return id; },
    clearInterval(id) { timers.delete(id); }, setTimeout(callback) { callback(); },
  });
  context.window = context;
  const emit = (type, event = {}) => { for (const callback of listeners.get(type) || []) callback(event); };
  const run = file => vm.runInContext(read(`assets/js/${file}`), context, { filename: file });
  run('destinations-data.js'); run('main.js');
  run({ 'index.html': 'index.js', 'destinations.html': 'destinations.js', 'destination.html': 'destination.js', 'trip-planner.html': 'trip-planner.js' }[page]);
  emit('DOMContentLoaded');
  return { context, document, elements, timers, media, emit, get: document.getElementById };
}

for (const page of pages) {
  const html = read(page);
  assert.deepEqual([...html.matchAll(/<script src="(https:[^"]+)"/g)].map(m => m[1]).sort(), [cdn, iconCdn].sort());
  assert.ok(html.includes(`<script src="${cdn}"></script>`));
  assert.equal(html.match(/<style type="text\/tailwindcss">([\s\S]*?)<\/style>/)[1], theme);
  assert.doesNotMatch(html, /bootstrap|tailwind\.config|responsive\.css/i);
  assert.doesNotMatch(html, /\p{Extended_Pictographic}/u, `${page}: use Solar icons instead of emoji`);
  const { elements, get } = fixture(page);
  assert.ok(get('main-content'));
  for (const el of elements) {
    for (const attribute of ['href', 'src']) {
      const value = el.getAttribute(attribute);
      if (!value || /^(https?:|#)/.test(value)) continue;
      assert.ok(!value.startsWith('/'), `${page}: project-relative asset ${value}`);
      assert.ok(existsSync(resolve(root, value.split(/[?#]/)[0])), `${page}: missing ${value}`);
    }
    for (const attribute of ['for', 'aria-controls', 'aria-describedby']) {
      for (const id of (el.getAttribute(attribute) || '').split(/\s+/).filter(Boolean)) assert.ok(get(id), `${page}: missing ${id}`);
    }
    if (el.attributes.onerror) new vm.Script(`function handler() { ${el.attributes.onerror} }`);
    if (el.tag === 'iconify-icon') {
      assert.match(el.attributes.icon, /^solar:[a-z0-9-]+-linear$/);
      assert.equal(el.attributes['aria-hidden'], 'true');
      assert.equal(el.attributes.width, '1em');
      assert.equal(el.attributes.height, '1em');
    }
  }
}
for (const file of readdirSync(resolve(root, 'assets/js'))) new vm.Script(read(`assets/js/${file}`), { filename: file });

const home = fixture('index.html');
const countCards = html => [...html.matchAll(/<article\b/g)].length;
assert.equal(countCards(home.get('featured-destinations').innerHTML), 5);
assert.equal(home.timers.size, 1);
home.get('carousel-prev').emit('click');
const slides = home.document.querySelectorAll('.carousel-slide');
assert.ok(slides[2].classList.contains('active'));
assert.equal(slides[0].inert, true);
assert.equal(slides[2].getAttribute('aria-hidden'), 'false');
home.get('carousel-next').emit('click');
assert.ok(slides[0].classList.contains('active'));
home.get('carousel-pause').emit('click');
assert.equal(home.timers.size, 0);
assert.ok(home.get('carousel-pause').innerHTML.includes('solar:play-linear'));
home.get('carousel-next').emit('click');
assert.equal(home.timers.size, 0, 'manual navigation preserves pause');
home.get('carousel-pause').emit('click');
assert.equal(home.timers.size, 1);
assert.ok(home.get('carousel-pause').innerHTML.includes('solar:pause-linear'));
home.document.hidden = true; home.emit('visibilitychange');
assert.equal(home.timers.size, 0);
home.document.hidden = false; home.emit('visibilitychange');
assert.equal(home.timers.size, 1);
const before = slides.findIndex(el => el.classList.contains('active'));
home.emit('keydown', { key: 'ArrowRight' });
assert.ok(slides[before].classList.contains('active'), 'arrows outside carousel do not move slides');
home.get('carousel-next').focus(); home.emit('keydown', { key: 'ArrowRight' });
assert.ok(slides[(before + 1) % 3].classList.contains('active'));
assert.equal(fixture('index.html', '', true).timers.size, 0);

const menu = home.get('nav-menu'), hamburger = home.get('nav-hamburger');
hamburger.emit('click'); assert.equal(hamburger.getAttribute('aria-expanded'), 'true');
assert.equal(home.document.body.style.overflow, 'hidden');
home.emit('keydown', { key: 'Escape' }); assert.equal(hamburger.getAttribute('aria-expanded'), 'false');
assert.equal(home.document.activeElement, hamburger);
hamburger.emit('click'); home.media.get('(min-width: 1024px)').emit('change');
assert.equal(home.document.body.style.overflow, ''); assert.ok(!menu.classList.contains('nav-open'));
hamburger.emit('click'); home.emit('click', { target: home.document.body });
assert.ok(!menu.classList.contains('nav-open'));

const catalog = fixture('destinations.html', '?category=beaches');
assert.equal(countCards(catalog.get('destinations-grid').innerHTML), 2);
catalog.get('region-filter').value = 'kota-batu'; catalog.get('region-filter').emit('change');
assert.equal(catalog.get('empty-state').style.display, 'flex');
catalog.get('empty-reset').emit('click');
assert.equal(countCards(catalog.get('destinations-grid').innerHTML), 10);
catalog.get('search-input').value = '  JoDiPaN '; catalog.get('search-input').emit('input');
assert.equal(countCards(catalog.get('destinations-grid').innerHTML), 1);
catalog.get('search-clear').emit('click');
assert.equal(countCards(catalog.get('destinations-grid').innerHTML), 10);

for (const dest of home.context.DESTINATIONS) {
  assert.match(dest.image, /^https:\/\/(?:thumb|upload)\.wikimedia\.org\//);
  assert.equal(dest.heroImage, dest.image);
  assert.equal(dest.gallery[0], dest.image);
  assert.ok(dest.gallery.length >= 1 && dest.gallery.length <= 2);
  const detail = fixture('destination.html', `?slug=${dest.slug}`);
  assert.ok(detail.get('detail-main').innerHTML.includes(dest.name));
  assert.ok(detail.get('detail-main').innerHTML.includes('lg:grid-cols-[minmax(0,1fr)_340px]'));
  assert.ok(detail.document.querySelectorAll('.nav-link').find(el => el.attributes.href === 'destinations.html').classList.contains('active'));
}
assert.equal(home.context.DESTINATIONS.flatMap(dest => dest.gallery).length, 19);
assert.ok(!home.context.DESTINATIONS.flatMap(dest => dest.gallery).some(url => url.includes('LAUT_BIRU')));
const payload = '<img src=x onerror=alert(1)>';
const notFound = fixture('destination.html', `?slug=${encodeURIComponent(payload)}`).get('detail-main').innerHTML;
assert.ok(notFound.includes('&lt;img')); assert.ok(!notFound.includes(payload));

const planner = fixture('trip-planner.html');
const form = planner.get('planner-form');
form.emit('submit');
assert.ok(planner.get('interest-error').textContent);
assert.equal(planner.document.activeElement, planner.get('travel-interest'));
planner.get('travel-interest').value = 'all'; planner.get('preferred-region').value = 'all';
planner.get('traveler-name').value = payload;
const radios = planner.elements.filter(el => el.tag === 'input' && el.attributes.type === 'radio');
function choose(name, value) { for (const el of radios.filter(el => el.attributes.name === name)) el.checked = el.value === value; }
choose('companions', 'family');
for (const [duration, limit] of [['1', 3], ['2', 5], ['3', 6]]) {
  choose('duration', duration); form.emit('submit');
  const output = planner.get('results-output').innerHTML;
  assert.equal(countCards(output), limit);
  assert.ok(output.includes('&lt;img')); assert.ok(!output.includes(payload));
  assert.ok(output.indexOf('Museum Angkut') < output.indexOf('Jodipan') || !output.includes('Jodipan'));
}
planner.get('travel-interest').value = 'beaches'; planner.get('preferred-region').value = 'kota-batu'; form.emit('submit');
assert.ok(planner.get('results-output').innerHTML.includes('Tidak Ada Rekomendasi'));
planner.get('reset-form-btn').emit('click');
assert.equal(planner.get('results-output').style.display, 'none');
assert.equal(planner.get('results-placeholder').style.display, 'flex');
assert.equal(planner.get('travel-interest').getAttribute('aria-invalid'), null);

console.log('PASS: 4 HTML pages, shared Tailwind/Iconify CDN/theme, Solar markup, 19 destination photos, local links, JS syntax, featured cards, carousel, mobile navigation, search/filter, 10 details, and planner validation/results/escaping.');
console.log('Visual rendering, remote assets, and GitHub Pages deployment require a connected browser.');
