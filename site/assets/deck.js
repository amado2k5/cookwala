/* Keyboard-navigable slide deck: arrows, space, page keys, number keys, swipe; the slide number is in the URL hash so a link is shareable. */
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide')); if (!slides.length) return;
  var i = Math.max(0, Math.min(slides.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));
  var counter = document.getElementById('counter'), bar = document.getElementById('bar');
  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
    counter.textContent = (i + 1) + ' / ' + slides.length; bar.style.width = ((i + 1) / slides.length * 100) + '%';
    if (history.replaceState) history.replaceState(null, '', '#' + (i + 1)); slides[i].focus && slides[i].setAttribute('tabindex', '-1');
  }
  document.getElementById('prev').addEventListener('click', function () { show(i - 1); });
  document.getElementById('next').addEventListener('click', function () { show(i + 1); });
  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    var rtl = document.documentElement.dir === 'rtl';
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); show(rtl && e.key === 'ArrowRight' ? i - 1 : i + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') { e.preventDefault(); show(rtl && e.key === 'ArrowLeft' ? i + 1 : i - 1); }
    else if (e.key === 'Home') show(0); else if (e.key === 'End') show(slides.length - 1);
  });
  var x0 = null; document.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1); x0 = null; });
  window.addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n && n - 1 !== i) show(n - 1); });
  show(i);
})();
