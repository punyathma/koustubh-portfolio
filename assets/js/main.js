/* Koustubh Kulkarni — portfolio scripts
   1. Media: fills every <figure class="media"> from its data-src
   2. Tabs: Videos / Photos / Links on project pages
   3. Lightbox: click a photo to open it big
   4. Reveal: sections fade in as you scroll
   5. Count-up: numbers with data-count animate once */

(function () {
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4 L20 12 L7 20 Z" fill="#121212"></path></svg>';

  // 1. MEDIA ---------------------------------------------------------------
  // data-type="image"   data-src="assets/media/photo.jpg"
  // data-type="video"   data-src="assets/media/clip.mp4"   (plays muted, on loop)
  // data-type="youtube" data-src="VIDEO_ID"                 (loads when clicked)
  // Leave data-src empty and the coloured placeholder with its label shows.
  document.querySelectorAll('.media').forEach(function (el) {
    var type = el.dataset.type || 'image';
    var src = (el.dataset.src || '').trim();
    var label = el.dataset.label || '';
    var root = document.body.dataset.root || '';

    if (label) {
      var l = document.createElement('figcaption');
      l.className = 'media__label';
      l.textContent = label;
      el.appendChild(l);
    }

    if (type === 'video' || type === 'youtube') {
      var b = document.createElement('button');
      b.className = 'media__play';
      b.type = 'button';
      b.setAttribute('aria-label', 'Play video' + (label ? ': ' + label : ''));
      b.innerHTML = PLAY;
      el.appendChild(b);
      if (!src) return;

      if (type === 'video') {
        var v = document.createElement('video');
        v.src = /^https?:/.test(src) ? src : root + src;
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
        el.insertBefore(v, el.firstChild);
        el.classList.add('is-loaded');
        b.addEventListener('click', function () { v.play(); el.classList.add('is-playing'); });
        if (el.hasAttribute('data-autoplay')) { v.autoplay = true; v.play().catch(function () {}); el.classList.add('is-playing'); }
      } else {
        var thumb = document.createElement('img');
        thumb.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(src) + '/hqdefault.jpg';
        thumb.alt = label;
        thumb.loading = 'lazy';
        el.insertBefore(thumb, el.firstChild);
        el.classList.add('is-loaded');
        b.addEventListener('click', function () {
          var f = document.createElement('iframe');
          f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(src) + '?autoplay=1';
          f.allow = 'autoplay; encrypted-media; picture-in-picture';
          f.allowFullscreen = true;
          f.title = label || 'Video';
          thumb.replaceWith(f);
          el.classList.add('is-playing');
        });
      }
      return;
    }

    if (!src) return;
    var img = document.createElement('img');
    img.src = /^https?:/.test(src) ? src : root + src;
    img.alt = el.dataset.alt || label;
    img.loading = 'lazy';
    el.insertBefore(img, el.firstChild);
    el.classList.add('is-loaded');
  });

  // 2. TABS ----------------------------------------------------------------
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = box.querySelectorAll('[role="tab"]');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) {
          var on = o === t;
          o.setAttribute('aria-selected', on ? 'true' : 'false');
          document.getElementById(o.getAttribute('aria-controls')).hidden = !on;
        });
      });
    });
  });

  // 3. LIGHTBOX ------------------------------------------------------------
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  lb.addEventListener('click', function () { lb.classList.remove('is-open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('is-open'); });
  document.querySelectorAll('.media[data-type="image"].is-loaded, .media:not([data-type]).is-loaded').forEach(function (el) {
    if (el.closest('a')) return;
    el.addEventListener('click', function () {
      var i = el.querySelector('img');
      lb.querySelector('img').src = i.src;
      lb.querySelector('img').alt = i.alt;
      lb.classList.add('is-open');
    });
  });

  // 4 + 5. REVEAL & COUNT-UP ------------------------------------------------
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
    if (reduce || isNaN(target)) return;
    var start = performance.now(), dur = 1100;
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var val = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = prefix + val.toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }
})();
