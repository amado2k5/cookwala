/* Docs pages: sidebar filter, copy page as Markdown, keyboard "/" to filter. Content is server-rendered. */
(function () {
  var filter = document.getElementById('filter'); var toc = document.getElementById('toc');
  if (filter && toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a')); var heads = Array.prototype.slice.call(toc.querySelectorAll('h4'));
    filter.addEventListener('input', function () {
      var q = filter.value.trim().toLowerCase();
      links.forEach(function (a) { a.hidden = !!q && a.textContent.toLowerCase().indexOf(q) === -1; });
      heads.forEach(function (h) { var n = h.nextElementSibling; var any = false; while (n && n.tagName === 'A') { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = !any; });
    });
    document.addEventListener('keydown', function (e) { if (e.key === '/' && document.activeElement !== filter && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); filter.focus(); } });
    var cur = toc.querySelector('[aria-current="page"]'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'center' });
  }
  var copy = document.getElementById('copyPage');
  if (copy) {
    copy.addEventListener('click', function () {
      fetch(copy.getAttribute('data-raw')).then(function (r) { return r.text(); }).then(function (md) { return navigator.clipboard.writeText(md); })
        .then(function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy page'; }, 1500); }, function () { copy.textContent = 'Copy blocked'; });
    });
  }
})();
