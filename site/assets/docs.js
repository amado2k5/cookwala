(function () {
  const $ = (s) => document.querySelector(s);
  const REPO = 'https://github.com/amado2k5/cookwala/blob/main/';
  // Organised by what the reader is trying to do (tutorials, how-to, reference, explanation).
  const NAV = [
    ['Get started', [['QUICKSTART', 'Quickstart (5 minutes)'], ['ROBOTICS', 'Robots, ROS 2 and datasets'], ['AGENT-SAFETY', 'Agent-safety benchmark'], ['HUMANITARIAN-PROFILE', 'Food banks and kitchens']]],
    ['Core standard', [['CORE', 'Core 0.2 (normative)'], ['RECIPE-FORMAT', 'Recipe format'], ['REGISTRY', 'Registry and publishing', 'draft'], ['API', 'APIs'], ['CLI', 'CLI'], ['INTEROP', 'Interoperability']]],
    ['Profiles', [['PROTOCOL', 'Protocol and Missions', 'exp'], ['MISSION', 'Mission and relief', 'exp'], ['DECISIONS', 'Decisions and budgets', 'exp'], ['REASONING', 'Reasoning and advice', 'exp'], ['HEALTH', 'Health and nutrition', 'exp'], ['EXTENSIBILITY', 'Extensions', 'exp'], ['ECOSYSTEM', 'Ecosystem and market', 'exp']]],
    ['Simulators', [['SIMULATION', 'Home kitchen'], ['CITY-SIMULATION', 'Two cities'], ['COUNTRY-SIMULATION', 'One country'], ['WORLD-SIMULATION', 'The world'], ['SIM-FINDINGS', 'What the simulators found']]],
    ['About', [['STRATEGY', 'Strategy'], ['ACTION-PLAN', 'Action plan'], ['CRITIQUES', 'Critiques we published'], ['GOVERNANCE', 'Governance'], ['CONTRIBUTING', 'Contributing'], ['SECURITY', 'Security policy'], ['PLAN', 'Original plan'], ['RESEARCH', 'Research'], ['PRIOR-ART', 'Prior art'], ['PATENT-LANDSCAPE', 'Patent landscape'], ['IMPLEMENTATION', 'Implementation'], ['EXPORT-FIFI', 'Exporting fifi.cooking']]]
  ];
  const ROOT_FILES = { GOVERNANCE: 'GOVERNANCE.md', CONTRIBUTING: 'CONTRIBUTING.md', SECURITY: 'SECURITY.md', 'AGENT-SAFETY': 'evals/kitchen-agent-safety/README.md' };
  const FLAT = NAV.flatMap(([, items]) => items);
  const slug = (t) => t.toLowerCase().trim().replace(/<[^>]+>/g, '').replace(/[^\w\- ]+/g, '').replace(/\s/g, '-');
  const page = () => (new URLSearchParams(location.search).get('p') || 'QUICKSTART').toUpperCase();
  const srcPath = (p) => ROOT_FILES[p] || `docs/${p}.md`;

  function buildNav(filter) {
    const toc = $('#toc'); toc.textContent = '';
    const cur = page(); const f = (filter || '').toLowerCase();
    for (const [group, items] of NAV) {
      const shown = items.filter(([id, t]) => !f || t.toLowerCase().includes(f) || id.toLowerCase().includes(f));
      if (!shown.length) continue;
      const h = document.createElement('h4'); h.textContent = group; toc.append(h);
      for (const [id, title, status] of shown) {
        const a = document.createElement('a'); a.href = `/docs/?p=${id}`; a.textContent = title;
        if (status) { const s = document.createElement('span'); s.className = 'status'; s.textContent = status === 'exp' ? 'exp' : status; a.append(s); }
        if (id === cur) a.setAttribute('aria-current', 'page');
        toc.append(a);
      }
    }
  }

  function rewriteLinks(root, file) {
    const base = file.includes('/') ? file.slice(0, file.lastIndexOf('/') + 1) : '';
    root.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (/^(https?:|mailto:|#|\/)/.test(href)) return;
      const [path, hash] = href.split('#');
      const name = path.split('/').pop();
      const id = name.replace(/\.md$/i, '').toUpperCase();
      if (/\.md$/i.test(name) && (FLAT.some(([p]) => p === id) || ROOT_FILES[id])) { a.href = `/docs/?p=${id}${hash ? '#' + hash : ''}`; return; }
      const resolved = new URL(path, 'https://x/' + base).pathname.slice(1);
      a.href = REPO + resolved + (hash ? '#' + hash : '');
    });
  }

  function render(md, id) {
    const html = DOMPurify.sanitize(marked.parse(md, { gfm: true }));
    const art = $('#content'); art.innerHTML = html;
    rewriteLinks(art, srcPath(id));
    const onp = $('#onpage'); onp.textContent = '';
    art.querySelectorAll('h1, h2, h3').forEach((h) => {
      h.id = slug(h.textContent);
      if (h.tagName !== 'H1') { const a = document.createElement('a'); a.className = 'anchor'; a.href = '#' + h.id; a.textContent = '#'; a.setAttribute('aria-label', 'Link to this section'); h.append(a); }
      if (h.tagName === 'H2') { const li = document.createElement('li'); const a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.firstChild.textContent; li.append(a); onp.append(li); }
    });
    const title = (art.querySelector('h1') || {}).textContent || id;
    document.title = `${title.replace('#', '').trim()} · Cookwala Docs`;
    const group = NAV.find(([, items]) => items.some(([p]) => p === id));
    $('#crumb').textContent = (group ? group[0] + ' / ' : '') + (FLAT.find(([p]) => p === id) || [id, id])[1];
    $('#editLink').href = REPO + srcPath(id); $('#rawLink').href = `/docs/md/${id}.md`;
    const i = FLAT.findIndex(([p]) => p === id); const pager = $('#pager'); pager.textContent = '';
    if (i > 0) { const a = document.createElement('a'); a.href = `/docs/?p=${FLAT[i - 1][0]}`; a.innerHTML = '<span>Previous</span>'; a.append(FLAT[i - 1][1]); pager.append(a); }
    if (i >= 0 && i < FLAT.length - 1) { const a = document.createElement('a'); a.className = 'next'; a.href = `/docs/?p=${FLAT[i + 1][0]}`; a.innerHTML = '<span>Next</span>'; a.append(FLAT[i + 1][1]); pager.append(a); }
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    window.__md = md;
  }

  function load() {
    const id = page(); buildNav($('#filter').value);
    fetch(`/docs/md/${id}.md`).then((r) => r.ok ? r.text() : Promise.reject(r.status)).then((md) => render(md, id))
      .catch(() => { $('#content').innerHTML = '<h1>Page not found</h1><p>Pick a page from the list, or <a href="/docs/?p=QUICKSTART">start with the quickstart</a>.</p>'; });
  }

  $('#filter').addEventListener('input', (e) => buildNav(e.target.value));
  document.addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement !== $('#filter')) { e.preventDefault(); $('#filter').focus(); } });
  $('#copyPage').addEventListener('click', (e) => {
    const b = e.currentTarget;
    navigator.clipboard.writeText(window.__md || '').then(() => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = 'Copy page'; }, 1500); }, () => { b.textContent = 'Copy blocked'; });
  });
  load();
})();
