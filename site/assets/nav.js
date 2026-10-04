/* Cookwala site: menu, theme switch, copy-to-clipboard for code blocks. No tracking. */
(function () {
  var btn = document.querySelector('.menu-btn'); var menu = document.getElementById('menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
  }
  var theme = document.querySelector('.theme-btn');
  if (theme) {
    theme.addEventListener('click', function () {
      var root = document.documentElement; var cur = root.getAttribute('data-theme');
      var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = dark ? 'light' : 'dark'; root.setAttribute('data-theme', next);
      try { localStorage.setItem('cw-theme', next); } catch (e) { /* storage may be unavailable */ }
    });
  }
  document.querySelectorAll('.codeblock pre, pre.code').forEach(function (pre) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'copy'; b.textContent = document.documentElement.lang === 'ar' ? 'نسخ' : 'Copy';
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.innerText).then(function () { b.textContent = document.documentElement.lang === 'ar' ? 'تم النسخ' : 'Copied'; setTimeout(function () { b.textContent = document.documentElement.lang === 'ar' ? 'نسخ' : 'Copy'; }, 1500); }, function () { b.textContent = 'Blocked'; });
    });
    var wrap = pre.parentElement; if (wrap && wrap.classList.contains('codeblock')) wrap.appendChild(b); else { pre.style.position = 'relative'; pre.appendChild(b); }
  });
})();
