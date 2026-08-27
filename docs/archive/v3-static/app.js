/* ═══════════════════════════════════════════════════════════════════════════
   Neel Patel — Portfolio Engine (High Performance 60fps Edition)
   Award-grade static engine: zero dependencies, zero build step.
   Runs directly off filesystem (file://) or any static host.
   
   Contents:
     1  utilities & state
     2  split text & entrance reveal animations
     3  navigation — DOM-authoritative numbering & scroll-spy
     4  video engine — poster-first, bounded MAX_LIVE, quality embeds
     5  ambient tone manager (Intersection-driven, 0 forced reflows)
     6  selected works — lead reel, 5 chapters, horizontal rail, fanned deck
     7  gallery — 52 uploads masonry, FLIP filter transitions
     8  toolkit — moving highlight band with clipped inverted text (viewport-gated)
     9  services — stacked sheets (viewport-gated)
    10  contact form
    11  chrome, cursor & misc
    12  scroll-driven curtain & single rAF loop
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var D = window.DATA;
if (!D) { console.error('data.js failed to load'); return; }

/* ───────────────────────────────────────────────────────────────────────────
   CONFIGURATION
   ─────────────────────────────────────────────────────────────────────────── */
var FORM_ENDPOINT = '';
var CONTACT_EMAIL = 'neelpatel00235@gmail.com';

/* Concurrency: 2 on desktop (>52rem), 1 on mobile */
var isMobileMedia = window.matchMedia('(max-width: 52rem)');
var MAX_LIVE = isMobileMedia.matches ? 1 : 2;
isMobileMedia.addEventListener('change', function (e) {
  MAX_LIVE = e.matches ? 1 : 2;
  Video.evict();
});

var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
var SAVE_DATA = (navigator.connection && (navigator.connection.saveData === true || /2g|3g/.test(navigator.connection.effectiveType))) || false;

/* ── 1 · utilities ───────────────────────────────────────────────────────── */
function qs(s, c) { return (c || document).querySelector(s); }
function qsa(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function arNum(s) {
  var p = String(s || '16:9').split(':');
  return p.length === 2 ? (+p[0] / +p[1]) : 1.7778;
}

function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  return Math.floor(sec / 60) + ':' + pad2(sec % 60);
}

function thumbSrc(id) { return 'assets/thumbs/' + id + '.webp'; }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

function hexToRgb(hex) {
  var h = String(hex).replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function blendHex(c1, c2, ratio) {
  var rgb1 = hexToRgb(c1);
  var rgb2 = hexToRgb(c2);
  var r = Math.round(rgb1[0] * ratio + rgb2[0] * (1 - ratio));
  var g = Math.round(rgb1[1] * ratio + rgb2[1] * (1 - ratio));
  var b = Math.round(rgb1[2] * ratio + rgb2[2] * (1 - ratio));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

/* ── 2 · split text & entrance animations ────────────────────────────────── */
function splitAll(scope) {
  qsa('[data-split]', scope).forEach(function (el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';

    var text = el.textContent.trim();
    var stagger = parseFloat(el.dataset.stagger || '0.025');
    el.setAttribute('aria-label', text);
    el.textContent = '';

    var n = 0;
    text.split('').forEach(function (ch) {
      if (ch === ' ') { el.appendChild(document.createTextNode(' ')); return; }
      var w = document.createElement('span');
      w.className = 'sw';
      w.setAttribute('aria-hidden', 'true');
      var i = document.createElement('i');
      i.textContent = ch;
      i.style.transitionDelay = (n * stagger).toFixed(3) + 's';
      w.appendChild(i);
      el.appendChild(w);
      n++;
    });
  });
}

var animIO = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (!e.isIntersecting) return;
    reveal(e.target);
    animIO.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

function reveal(el) {
  el.classList.add('in');
  var targets = el.hasAttribute('data-anim') ? [el] : qsa('[data-anim]', el);
  targets.forEach(function (t) {
    t.addEventListener('transitionend', function () {
      t.style.willChange = 'auto';
    }, { once: true });
  });
}

function observeAnims(scope) {
  qsa('.pair,[data-anim],[data-split]', scope).forEach(function (el) {
    if (el.closest('#loader') || el.closest('#about')) return;
    if (el.hasAttribute('data-anim') && el.parentElement && el.closest('.pair')) return;
    if (el.classList.contains('in')) return;
    if (REDUCED) { el.classList.add('in'); return; }
    animIO.observe(el);
  });
}

/* ── 3 · navigation — DOM order is authoritative ─────────────────────────── */
function buildNav() {
  var secs = qsa('main > section[data-nav]');
  var list = qs('#menuList');
  var now = qs('#hdrNow');
  var rail = qs('#progressRail');

  list.innerHTML = secs.map(function (s, i) {
    var n = pad2(i + 1);
    var label = qs('.sect__label span', s);
    if (label) label.textContent = n;
    return '' +
      '<li><a href="#' + s.id + '" data-spy="' + s.id + '">' +
        '<span class="menu__n">' + n + '</span>' +
        '<span class="menu__t">' + esc(s.dataset.nav) + '</span>' +
      '</a></li>';
  }).join('');

  rail.innerHTML = secs.map(function (s) {
    return '<span class="progress-rail__dot" data-target="' + s.id + '"></span>';
  }).join('');

  var menuLinks = qsa('a[data-spy]', list);
  var navLinks = qsa('.hdr__nav a[data-spy]');
  var dots = qsa('.progress-rail__dot', rail);
  var active = null;

  function mark(id, n, label) {
    if (id === active) return;
    active = id;
    now.innerHTML = '<b>' + n + '</b> ' + esc(label);
    menuLinks.forEach(function (a) { a.classList.toggle('is-here', a.dataset.spy === id); });
    navLinks.forEach(function (a) { a.classList.toggle('is-here', a.dataset.spy === id); });
    dots.forEach(function (d) { d.classList.toggle('is-active', d.dataset.target === id); });
  }

  if (secs.length > 0) {
    mark(secs[0].id, '01', secs[0].dataset.nav);
  }

  var spyIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var i = secs.indexOf(e.target);
      mark(e.target.id, pad2(i + 1), e.target.dataset.nav);
    });
  }, { rootMargin: '-40% 0px -45% 0px', threshold: 0 });

  secs.forEach(function (s) { spyIO.observe(s); });
}

/* ── 4 · video engine ───────────────────────────────────────────────────────
   Zero initial iframes. Injected on scroll, bounded by MAX_LIVE with LRU
   eviction. Sound upgrade on tap/click.
   ─────────────────────────────────────────────────────────────────────────── */
var Video = {
  live: [],
  io: null,

  init: function () {
    var self = this;
    var rootMargin = isMobileMedia.matches ? '150px 0px' : '250px 0px';

    this.io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (!e.isIntersecting) {
          self.unmount(el);
          return;
        }
        if (e.intersectionRatio < 0.15) return;
        if (REDUCED || SAVE_DATA) return;
        if (el.hasAttribute('data-video-auto')) self.mount(el, 'loop');
      });
    }, { threshold: [0, 0.15], rootMargin: rootMargin });

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.reel__sound-btn');
      if (btn) {
        var reelHost = qs('.reel .vid[data-video]');
        if (reelHost) self.mount(reelHost, 'play');
        return;
      }

      var el = e.target.closest && e.target.closest('.vid[data-video]');
      if (el) {
        self.mount(el, 'play');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = document.activeElement;
      if (!el || !el.classList || !el.classList.contains('vid')) return;
      e.preventDefault();
      self.mount(el, 'play');
    });
  },

  observe: function (scope) {
    var self = this;
    qsa('.vid[data-video]', scope).forEach(function (el) { self.io.observe(el); });
  },

  src: function (id, mode) {
    var q = mode === 'loop'
      ? 'background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=1080p'
      : 'autoplay=1&loop=0&title=0&byline=0&portrait=0&badge=0&playsinline=1&autopause=1&dnt=1&quality=1080p';
    return 'https://player.vimeo.com/video/' + id + '?' + q;
  },

  mount: function (el, forceMode) {
    var mode = forceMode || el.dataset.videoMode || 'play';
    if (el.dataset.liveMode === mode) return;
    if (el.dataset.liveMode) this.unmount(el);

    if (mode === 'play') this.stopAll();

    var rect = el.getBoundingClientRect();
    var devWidth = Math.min(1920, Math.round(rect.width * (window.devicePixelRatio || 1)));
    var devHeight = Math.round(devWidth / arNum(el.style.getPropertyValue('--ar')));

    var f = document.createElement('iframe');
    f.className = 'vid__frame';
    f.src = this.src(el.dataset.video, mode);
    f.title = el.dataset.videoTitle || 'Video player';
    f.width = String(devWidth);
    f.height = String(devHeight);
    f.setAttribute('frameborder', '0');
    f.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    if (mode === 'loop') f.setAttribute('tabindex', '-1');

    el.appendChild(f);
    el.dataset.liveMode = mode;
    el.classList.add('is-live');
    if (mode === 'play') el.classList.add('is-sound');
    this.live.push(el);

    this.evict();
  },

  evict: function () {
    while (this.live.length > MAX_LIVE) {
      this.unmount(this.live[0]);
    }
  },

  unmount: function (el) {
    if (!el.dataset.liveMode) return;
    var f = qs('.vid__frame', el);
    if (f) {
      f.src = 'about:blank';
      f.remove();
    }
    delete el.dataset.liveMode;
    el.classList.remove('is-live', 'is-sound');
    var i = this.live.indexOf(el);
    if (i > -1) this.live.splice(i, 1);
  },

  stopAll: function () {
    var self = this;
    this.live.slice().forEach(function (el) { self.unmount(el); });
  },

  html: function (w, opts) {
    opts = opts || {};
    var mode = opts.mode || 'play';
    var ar = arNum(w.aspect).toFixed(4);
    var tone = w.tone || '#d6a76c';
    return '' +
      '<div class="vid" style="--ar:' + ar + ';--tone:' + tone + '" data-video="' + w.id + '" ' +
           'data-video-mode="' + mode + '"' + (opts.auto ? ' data-video-auto' : '') + ' ' +
           'data-video-title="' + esc(w.title) + '" ' +
           'data-cursor="' + (opts.cursor || 'Play') + '" ' +
           'role="button" tabindex="0" aria-label="Play ' + esc(w.title) + '">' +
        '<img class="vid__poster" src="' + thumbSrc(w.id) + '" alt="' + esc(w.title) + '" ' +
             'width="' + w.w + '" height="' + w.h + '" ' +
             (opts.eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">' +
        (mode === 'loop' ? '<span class="vid__flag" aria-hidden="true">Looping</span>' : '') +
        '<span class="vid__play" aria-hidden="true"><i></i></span>' +
      '</div>';
  }
};

/* ── 5 · ambient tone manager (0 forced reflows) ───────────────────────────
   Uses IntersectionObserver instead of per-frame getBoundingClientRect().
   ─────────────────────────────────────────────────────────────────────────── */
var ToneManager = {
  currentTone: '',
  glowEl: null,
  activeVideo: null,

  init: function () {
    var self = this;
    this.glowEl = qs('#ambientGlow');

    var toneIO = new IntersectionObserver(function (entries) {
      var topEntry = null;
      var maxRatio = 0;
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > maxRatio) {
          maxRatio = e.intersectionRatio;
          topEntry = e.target;
        }
      });
      if (topEntry) self.applyTone(topEntry);
    }, { threshold: [0.2, 0.5, 0.8] });

    qsa('.vid[data-video]').forEach(function (el) { toneIO.observe(el); });
  },

  applyTone: function (vid) {
    if (vid === this.activeVideo) return;
    this.activeVideo = vid;
    var rawTone = vid.style.getPropertyValue('--tone') || '#d6a76c';
    var blendedTone = blendHex(rawTone, '#13100c', 0.65);
    if (blendedTone !== this.currentTone) {
      this.currentTone = blendedTone;
      document.documentElement.style.setProperty('--tone', rawTone);
      document.documentElement.style.setProperty('--tone-blend', blendedTone.replace('rgb', 'rgba').replace(')', ', 0.16)'));
    }
  },

  frame: function () {
    // Zero-overhead frame hook
  }
};

/* ── 6 · selected works ──────────────────────────────────────────────────── */
var Works = {
  reelHost: null,
  reelInner: null,
  reelOnScreen: false,
  chapters: [],
  chaptersOnScreen: false,
  railTrack: null,
  railViewport: null,
  railOnScreen: false,
  conroyDeck: null,

  build: function () {
    this.buildReel();
    this.buildChapters();
    this.buildRail();
    this.buildConroyDeck();
  },

  buildReel: function () {
    var leadSec = D.SECTIONS[0]; // Absolute Cinema
    var leadWork = leadSec.works[0]; // Mumbai Cinematic
    var host = qs('#reel');
    this.reelHost = host;

    host.innerHTML = '' +
      '<div class="reel__window">' +
        Video.html(leadWork, { mode: 'loop', auto: true, eager: true, cursor: 'Sound' }) +
      '</div>' +
      '<div class="reel__overlay">' +
        '<div class="reel__content">' +
          '<div>' +
            '<p class="label" style="color:var(--kraft);margin-bottom:0.75rem;">' +
              'L E A D &nbsp; F I L M <svg class="label__star" viewBox="0 0 12 12" width="8" height="8" aria-hidden="true"><path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="currentColor"/></svg> ' + esc(leadSec.title) +
            '</p>' +
            '<h3 class="reel__title font-display">' + esc(leadWork.title) + '</h3>' +
          '</div>' +
          '<div class="reel__meta">' +
            '<p class="reel__specs">' + leadWork.aspect + ' · ' + fmtDur(leadWork.duration) + ' · 1280×720</p>' +
            '<button class="reel__sound-btn" type="button" aria-label="Tap for sound">' +
              '<span>◀)) TAP FOR SOUND</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.reelInner = qs('.reel__window', host);

    var self = this;
    new IntersectionObserver(function (entries) {
      self.reelOnScreen = entries[0].isIntersecting;
    }, { rootMargin: '10% 0px' }).observe(host);
  },

  buildChapters: function () {
    var host = qs('#chapters');
    var picks = [
      { kicker: 'Concert & Live', slug: 'concert-edits', idx: 0, num: '01' },
      { kicker: 'Masking & VFX', slug: 'masking', idx: 0, num: '02' },
      { kicker: 'Rhythm & Montage', slug: 'fast-montage', idx: 0, num: '03' },
      { kicker: 'Motion Graphics', slug: 'motion-graphics', idx: 0, num: '04' },
      { kicker: 'Anime Grading', slug: 'anime-grade', idx: 0, num: '05' }
    ];

    var html = '';
    picks.forEach(function (p, idx) {
      var found = null;
      for (var s = 0; s < D.SECTIONS.length; s++) {
        if (D.SECTIONS[s].slug === p.slug) {
          found = { sec: D.SECTIONS[s], work: D.SECTIONS[s].works[p.idx] || D.SECTIONS[s].works[0] };
          break;
        }
      }
      if (!found) {
        found = { sec: D.SECTIONS[idx], work: D.SECTIONS[idx].works[0] };
      }

      var dir = idx % 2 === 0 ? 'slot--left' : 'slot--right';
      html += '' +
        '<article class="chapter" data-chapter="' + idx + '">' +
          '<p class="chapter__back-title" aria-hidden="true">' + esc(found.work.title) + '</p>' +
          '<div class="chapter__video-slot ' + dir + '">' +
            Video.html(found.work, { mode: 'loop', auto: true, cursor: 'Sound' }) +
          '</div>' +
          '<div class="chapter__front">' +
            '<div class="chapter__info">' +
              '<p class="chapter__kicker">CHAPTER ' + p.num + ' / 05 · ' + esc(p.kicker) + '</p>' +
              '<h4 class="chapter__name">' + esc(found.work.title) + '</h4>' +
            '</div>' +
            '<p class="label">' + found.work.aspect + ' · ' + fmtDur(found.work.duration) + '</p>' +
          '</div>' +
        '</article>';
    });

    host.innerHTML = html;
    this.chapters = qsa('.chapter', host).map(function (el, idx) {
      return {
        el: el,
        back: qs('.chapter__back-title', el),
        slot: qs('.chapter__video-slot', el),
        isLeft: idx % 2 === 0
      };
    });

    var self = this;
    new IntersectionObserver(function (entries) {
      self.chaptersOnScreen = entries[0].isIntersecting;
    }, { rootMargin: '20% 0px' }).observe(host);
  },

  buildRail: function () {
    var host = qs('#railTrack');
    this.railTrack = host;
    this.railViewport = qs('.rail-viewport');

    var items = [];
    D.SECTIONS.forEach(function (s) {
      s.works.forEach(function (w) {
        if (items.length < 14 && w.id !== '1220554546') {
          items.push({ s: s, w: w });
        }
      });
    });

    host.innerHTML = items.map(function (item) {
      return '' +
        '<div class="rail-card">' +
          Video.html(item.w, { mode: 'loop', auto: false, cursor: 'Play' }) +
          '<div class="rail-card__caption">' +
            '<span class="rail-card__title">' + esc(item.w.title) + '</span>' +
            '<span class="rail-card__tag">' + esc(item.s.title) + '</span>' +
          '</div>' +
        '</div>';
    }).join('');

    var self = this;
    if (this.railViewport) {
      new IntersectionObserver(function (entries) {
        self.railOnScreen = entries[0].isIntersecting;
      }, { rootMargin: '10% 0px' }).observe(this.railViewport);
    }
  },

  buildConroyDeck: function () {
    var host = qs('#conroyDeck');
    this.conroyDeck = host;
    var brandSec = null;
    for (var i = 0; i < D.SECTIONS.length; i++) {
      if (D.SECTIONS[i].slug === 'brand-films') { brandSec = D.SECTIONS[i]; break; }
    }
    if (!brandSec) brandSec = D.SECTIONS[0];
    var cuts = brandSec.works.slice(1, 10);

    host.innerHTML = cuts.map(function (w, i) {
      return '' +
        '<div class="conroy-card" style="z-index:' + (10 - i) + ';" data-id="' + w.id + '">' +
          Video.html(w, { mode: i === 0 ? 'loop' : 'play', auto: false, cursor: 'View' }) +
        '</div>';
    }).join('');

    var deckEl = this.conroyDeck;
    deckEl.addEventListener('click', function () {
      deckEl.classList.toggle('is-fanned');
    });

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !isMobileMedia.matches) {
        deckEl.classList.add('is-fanned');
      }
    }, { threshold: 0.3 }).observe(host);
  },

  frame: function () {
    if (this.reelOnScreen && !REDUCED && this.reelInner && this.reelHost) {
      var r = this.reelHost.getBoundingClientRect();
      var p = clamp((r.top + r.height / 2 - innerHeight / 2) / innerHeight, -1, 1);
      this.reelInner.style.transform = 'translate3d(0,' + (p * -3).toFixed(2) + '%,0)';
    }

    if (this.chaptersOnScreen && !REDUCED) {
      var h = innerHeight;
      this.chapters.forEach(function (ch) {
        var rect = ch.el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < h) {
          var progress = clamp((h - rect.top) / (h + rect.height), 0, 1);
          var inset = ((1 - progress) * 18).toFixed(1);
          if (ch.isLeft) {
            ch.slot.style.clipPath = 'inset(0 ' + inset + '% 0 0)';
          } else {
            ch.slot.style.clipPath = 'inset(0 0 0 ' + inset + '%)';
          }
          var counterX = ((progress - 0.5) * 30).toFixed(1);
          ch.back.style.transform = 'translate3d(' + counterX + 'px,0,0)';
        }
      });
    }

    // Gentle, comfortable timeline drift on desktop
    if (this.railOnScreen && FINE && !isMobileMedia.matches && !REDUCED && this.railTrack && this.railViewport) {
      var railRect = this.railViewport.getBoundingClientRect();
      if (railRect.bottom > 0 && railRect.top < innerHeight) {
        var totalDist = this.railTrack.scrollWidth - this.railViewport.clientWidth;
        var rProgress = clamp((innerHeight - railRect.top) / (innerHeight + railRect.height * 1.5), 0, 1);
        var smoothProgress = rProgress * 0.35;
        this.railTrack.style.transform = 'translate3d(' + (-smoothProgress * totalDist).toFixed(1) + 'px,0,0)';
      }
    }
  }
};

/* ── 7 · gallery ─────────────────────────────────────────────────────────── */
var Gallery = {
  grid: null,
  activeFilter: 'all',

  init: function () {
    this.grid = qs('#galleryGrid');
    this.buildGrid();
    this.initFilters();
  },

  buildGrid: function () {
    var allWorks = [];
    var seenIds = {};

    D.SECTIONS.forEach(function (s) {
      s.works.forEach(function (w) {
        if (!seenIds[w.id]) {
          seenIds[w.id] = true;
          allWorks.push({
            id: w.id,
            title: w.title,
            aspect: w.aspect,
            duration: w.duration,
            w: w.w,
            h: w.h,
            tone: w.tone || s.accent,
            discipline: s.title,
            kicker: s.kicker
          });
        }
      });
    });

    this.grid.innerHTML = allWorks.map(function (w) {
      return '' +
        '<article class="gallery-card" data-kicker="' + esc(w.kicker) + '" data-id="' + w.id + '">' +
          Video.html(w, { mode: 'play', cursor: 'Play' }) +
          '<div class="gallery-card__caption">' +
            '<h4 class="gallery-card__title">' + esc(w.title) + '</h4>' +
            '<div class="gallery-card__meta">' +
              '<span class="gallery-card__disc">' + esc(w.discipline) + '</span>' +
              '<span>' + w.aspect + ' · ' + fmtDur(w.duration) + '</span>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    Video.observe(this.grid);
  },

  initFilters: function () {
    var self = this;
    var container = qs('#galleryFilters');
    if (!container) return;

    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.gallery__chip');
      if (!btn) return;

      var filter = btn.dataset.filter;
      if (filter === self.activeFilter) return;
      self.activeFilter = filter;

      qsa('.gallery__chip', container).forEach(function (b) {
        var isThis = b === btn;
        b.classList.toggle('is-active', isThis);
        b.setAttribute('aria-pressed', String(isThis));
      });

      self.applyFilter(filter);
    });
  },

  applyFilter: function (filter) {
    var cards = qsa('.gallery-card', this.grid);
    cards.forEach(function (card) {
      var match = filter === 'all' || card.dataset.kicker === filter;
      card.classList.toggle('is-hidden', !match);
    });
  }
};

/* ── 8 · toolkit — moving highlight band (viewport-gated) ────────────────── */
var Skills = {
  band: null,
  list: null,
  rows: [],
  stage: null,
  onScreen: false,

  init: function () {
    this.band = qs('#skillsBand');
    this.list = qs('#skillsList');
    this.stage = qs('.skills__stage');

    this.list.innerHTML = D.SKILLS.map(function (s, i) {
      return '' +
        '<div class="skill__row" data-idx="' + i + '">' +
          '<div class="skill__word-base">' + esc(s.name) + '</div>' +
          '<div class="skill__word-inverted" aria-hidden="true">' + esc(s.name) + '</div>' +
          '<p class="skill__desc">' + s.desc + '</p>' +
        '</div>';
    }).join('');

    this.rows = qsa('.skill__row', this.list).map(function (el) {
      return {
        el: el,
        base: qs('.skill__word-base', el),
        inverted: qs('.skill__word-inverted', el),
        desc: qs('.skill__desc', el)
      };
    });

    var self = this;
    if (this.stage) {
      new IntersectionObserver(function (entries) {
        self.onScreen = entries[0].isIntersecting;
      }, { rootMargin: '10% 0px' }).observe(this.stage);
    }
  },

  frame: function () {
    if (!this.onScreen || !this.stage || !this.band || REDUCED) return;
    var bandRect = this.band.getBoundingClientRect();
    var bandCenter = bandRect.top + bandRect.height / 2;

    var activeIdx = -1;
    var minDist = Infinity;

    this.rows.forEach(function (row, i) {
      var r = row.el.getBoundingClientRect();
      var rowCenter = r.top + r.height / 2;
      var dist = Math.abs(bandCenter - rowCenter);

      if (dist < minDist) {
        minDist = dist;
        activeIdx = i;
      }

      var clipTop = clamp(bandRect.top - r.top, 0, r.height);
      var clipBottom = clamp(bandRect.bottom - r.top, 0, r.height);
      row.inverted.style.clipPath = 'polygon(0px ' + clipTop + 'px, 100% ' + clipTop + 'px, 100% ' + clipBottom + 'px, 0px ' + clipBottom + 'px)';
    });

    this.rows.forEach(function (row, i) {
      var offset = Math.abs(i - activeIdx);
      var op = clamp(1 - offset * 0.22, 0.15, 1);
      row.base.style.opacity = op.toFixed(2);
      row.el.classList.toggle('is-active', i === activeIdx && minDist < 60);
    });
  }
};

/* ── 9 · services — stacked sheets (viewport-gated) ──────────────────────── */
var Services = {
  stack: null,
  sheets: [],
  onScreen: false,

  init: function () {
    this.stack = qs('#servicesStack');
    var n = D.SERVICES.length;

    this.stack.innerHTML = D.SERVICES.map(function (s, i) {
      var isIndigo = (i === 3) ? ' sheet--indigo' : '';
      return '' +
        '<article class="service-sheet' + isIndigo + '" data-sheet="' + i + '">' +
          '<div class="service-sheet__top">' +
            '<span class="service-sheet__n">' + pad2(i + 1) + ' / ' + pad2(n) + '</span>' +
            '<p class="label">D E L I V E R A B L E <svg class="label__star" viewBox="0 0 12 12" width="8" height="8" aria-hidden="true"><path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="currentColor"/></svg></p>' +
          '</div>' +
          '<div>' +
            '<h3 class="service-sheet__name font-display">' + esc(s.name) + '</h3>' +
            '<p class="service-sheet__desc">' + s.desc + '</p>' +
          '</div>' +
          '<div class="service-sheet__arrow"><i class="arrow"></i></div>' +
        '</article>';
    }).join('');

    this.sheets = qsa('.service-sheet', this.stack);

    var self = this;
    if (this.stack) {
      new IntersectionObserver(function (entries) {
        self.onScreen = entries[0].isIntersecting;
      }, { rootMargin: '10% 0px' }).observe(this.stack);
    }
  },

  frame: function () {
    if (!this.onScreen || !this.sheets.length || REDUCED) return;
    var scaleStep = isMobileMedia.matches ? 0.01 : 0.03;

    for (var i = 0; i < this.sheets.length - 1; i++) {
      var current = this.sheets[i];
      var next = this.sheets[i + 1];
      var nextRect = next.getBoundingClientRect();
      var currentRect = current.getBoundingClientRect();

      if (nextRect.top < currentRect.bottom && nextRect.top > currentRect.top) {
        var diff = currentRect.bottom - nextRect.top;
        var p = clamp(diff / currentRect.height, 0, 1);
        var s = (1 - p * scaleStep).toFixed(3);
        var op = (1 - p * 0.5).toFixed(2);
        current.style.transform = 'scale(' + s + ')';
        current.style.opacity = op;
      } else if (nextRect.top <= currentRect.top) {
        current.style.transform = 'scale(' + (1 - scaleStep) + ')';
        current.style.opacity = '0.5';
      } else {
        current.style.transform = 'scale(1)';
        current.style.opacity = '1';
      }
    }
  }
};

/* ── 10 · contact form ───────────────────────────────────────────────────── */
function initForm() {
  var f = qs('#contactForm');
  if (!f) return;
  var status = qs('#formStatus');
  var btn = qs('.cta__send', f);
  var fields = qsa('input,textarea', f).filter(function (el) {
    return !el.closest('.field--trap');
  });

  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'cta__status' + (kind ? ' is-' + kind : '');
  }

  function flag(el, bad) {
    var wrap = el.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('is-bad', bad);
    var err = qs('.field__err', wrap);
    if (bad) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field__err';
        wrap.appendChild(err);
      }
      err.textContent = el.validationMessage || 'This field is required.';
    } else if (err) {
      err.remove();
    }
  }

  fields.forEach(function (el) {
    el.addEventListener('input', function () { if (el.checkValidity()) flag(el, false); });
    el.addEventListener('change', function () { if (el.checkValidity()) flag(el, false); });
  });

  function compose() {
    var d = new FormData(f);
    var body = [
      'Name: ' + d.get('name'),
      'Email: ' + d.get('email'),
      '',
      'Message:',
      d.get('message')
    ].join('\r\n');
    location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent('Project enquiry — ' + d.get('name')) +
      '&body=' + encodeURIComponent(body);
    say('Mail draft opened — hit send and it reaches me.', 'ok');
  }

  f.addEventListener('submit', function (e) {
    e.preventDefault();

    var bad = fields.filter(function (el) {
      var ok = el.checkValidity();
      flag(el, !ok);
      return !ok;
    });

    if (bad.length) {
      say(plural(bad.length, 'field') + ' still ' + (bad.length === 1 ? 'needs' : 'need') + ' attention.', 'err');
      bad[0].focus();
      return;
    }

    if (f._gotcha && f._gotcha.value) {
      say('Thanks — message received.', 'ok');
      return;
    }

    if (!FORM_ENDPOINT) {
      compose();
      return;
    }

    btn.disabled = true;
    say('Sending message…');
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(f)
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      f.reset();
      say('Message received. I will reply within 24 hours.', 'ok');
    }).catch(function () {
      say('Unable to send automatically. Opening your email app…', 'err');
      setTimeout(compose, 900);
    }).then(function () {
      btn.disabled = false;
    });
  });
}

/* ── 11 · chrome, cursor & misc ──────────────────────────────────────────── */
var Cursor = { el: null, x: 0, y: 0, tx: 0, ty: 0, on: false, dirty: false };

function initCursor() {
  if (!FINE || REDUCED) return;
  var cur = qs('#cursor');
  if (!cur) return;
  var label = qs('.cursor__label', cur);
  Cursor.el = cur;
  Cursor.x = Cursor.tx = innerWidth / 2;
  Cursor.y = Cursor.ty = innerHeight / 2;
  Cursor.on = true;

  addEventListener('pointermove', function (e) {
    Cursor.tx = e.clientX; Cursor.ty = e.clientY;
    Cursor.dirty = true;
    cur.classList.add('is-on');
  }, { passive: true });

  document.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });

  document.addEventListener('pointerover', function (e) {
    var t = e.target.closest && e.target.closest('[data-cursor]');
    if (!t) return;
    label.textContent = t.dataset.cursor;
    cur.classList.add('is-hot');
  });

  document.addEventListener('pointerout', function (e) {
    var t = e.target.closest && e.target.closest('[data-cursor]');
    if (!t) return;
    if (e.relatedTarget && t.contains(e.relatedTarget)) return;
    cur.classList.remove('is-hot');
  });
}

Cursor.frame = function () {
  if (!this.on || !this.dirty) return;
  this.x = lerp(this.x, this.tx, 0.22);
  this.y = lerp(this.y, this.ty, 0.22);
  this.el.style.transform = 'translate3d(' + this.x.toFixed(1) + 'px,' + this.y.toFixed(1) + 'px,0)';
  if (Math.abs(this.tx - this.x) < 0.1 && Math.abs(this.ty - this.y) < 0.1) {
    this.dirty = false;
  }
};

function initChrome() {
  var hdr = qs('#hdr');
  var btn = qs('#menuBtn');
  var btnTxt = qs('#menuBtnTxt');
  var menu = qs('#menu');
  var last = 0;

  addEventListener('scroll', function () {
    var y = scrollY;
    hdr.classList.toggle('is-stuck', y > 40);
    var hide = y > last && y > 260 && !document.body.classList.contains('menu-open');
    hdr.classList.toggle('is-hidden', hide);
    last = y;
  }, { passive: true });

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
    btn.setAttribute('aria-expanded', String(open));
    btnTxt.textContent = open ? 'Close' : 'Index';
  }

  btn.addEventListener('click', function () {
    setMenu(!document.body.classList.contains('menu-open'));
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var targetId = a.getAttribute('href').slice(1);
    var targetEl = document.getElementById(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
      if (history.pushState) history.pushState(null, null, '#' + targetId);
    }
  });
}

function initMisc() {
  qsa('[data-copy]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard.writeText(a.dataset.copy).then(function () {
        var was = a.dataset.cursor;
        a.dataset.cursor = 'Copied!';
        var lbl = qs('.cursor__label');
        if (lbl) lbl.textContent = 'Copied!';
        setTimeout(function () {
          a.classList.remove('is-copied');
          a.dataset.cursor = was;
        }, 1600);
      }).catch(function () { location.href = a.href; });
    });
  });

  var yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  var editsEl = qs('#statEdits');
  if (editsEl) editsEl.textContent = D.STATS.edits;
  var catsEl = qs('#statCats');
  if (catsEl) catsEl.textContent = D.STATS.categories;
}

/* ── 12 · scroll-driven curtain (namy.design aperture style) ─────────────── */
var Curtain = {
  stage: null,
  topBand: null,
  bottomBand: null,
  splitEl: null,
  heroMid: null,
  heroFront: null,
  heroBack: null,
  onScreen: true,
  lastProgress: -1,

  init: function () {
    this.stage = qs('.hero-stage');
    this.topBand = qs('#curtainTop');
    this.bottomBand = qs('#curtainBottom');
    this.splitEl = qs('#curtainSplit');
    this.heroMid = qs('.hero__mid');
    this.heroFront = qs('.hero__front');
    this.heroBack = qs('.hero__back');

    if (REDUCED && this.splitEl) {
      this.splitEl.style.display = 'none';
      if (this.heroMid) { this.heroMid.style.transform = 'none'; this.heroMid.style.opacity = '1'; }
      if (this.heroFront) { this.heroFront.style.transform = 'none'; this.heroFront.style.opacity = '1'; }
      if (this.heroBack) { this.heroBack.style.transform = 'none'; this.heroBack.style.opacity = '0.18'; }
    }

    var self = this;
    if (this.stage) {
      new IntersectionObserver(function (entries) {
        self.onScreen = entries[0].isIntersecting;
      }, { rootMargin: '10% 0px' }).observe(this.stage);
    }
  },

  frame: function () {
    if (!this.onScreen || !this.stage || !this.topBand || !this.bottomBand || REDUCED) return;
    var rect = this.stage.getBoundingClientRect();
    var scrollDist = rect.height - innerHeight;
    if (scrollDist <= 0) return;

    // Progress goes from 0.0 (closed) to 1.0 (fully open)
    var progress = clamp(-rect.top / scrollDist, 0, 1);
    if (Math.abs(progress - this.lastProgress) < 0.001) return;
    this.lastProgress = progress;

    var pTop = (-progress * 105).toFixed(2);
    var pBottom = (progress * 105).toFixed(2);

    this.topBand.style.transform = 'translate3d(0,' + pTop + '%,0)';
    this.bottomBand.style.transform = 'translate3d(0,' + pBottom + '%,0)';

    // Dynamic entrance animation as the curtains open (0.0 to 0.7)
    var enterP = clamp(progress / 0.7, 0, 1);
    var ease = 1 - Math.pow(1 - enterP, 3); // Fast hardware cubic ease-out

    if (this.heroMid) {
      var midX = (-80 * (1 - ease)).toFixed(1);
      this.heroMid.style.transform = 'translate3d(' + midX + 'px, 0, 0)';
      this.heroMid.style.opacity = (ease * 1.1).toFixed(2);
    }

    if (this.heroFront) {
      var frontX = (80 * (1 - ease)).toFixed(1);
      this.heroFront.style.transform = 'translate3d(' + frontX + 'px, 0, 0)';
      this.heroFront.style.opacity = (ease * 1.1).toFixed(2);
    }

    if (this.heroBack) {
      var scaleVal = (0.86 + 0.14 * ease).toFixed(3);
      this.heroBack.style.transform = 'scale(' + scaleVal + ')';
      this.heroBack.style.opacity = (0.18 * ease).toFixed(2);
    }
  }
};

/* ── initialization ──────────────────────────────────────────────────────── */
splitAll(document);
buildNav();
Video.init();
ToneManager.init();
Works.build();
Gallery.init();
Skills.init();
Services.init();
Curtain.init();
initCursor();
initChrome();
initForm();
initMisc();

observeAnims(document);
Video.observe(document);

/* ── single requestAnimationFrame loop (smooth 60fps) ─────────────────────── */
(function loop() {
  Cursor.frame();
  Curtain.frame();
  Works.frame();
  Skills.frame();
  Services.frame();
  requestAnimationFrame(loop);
})();

})();
