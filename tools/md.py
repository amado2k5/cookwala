"""Small Markdown to HTML converter for the Cookwala docs (standard library only).

Supports the subset the documentation uses: ATX headings with ids, paragraphs, emphasis, inline
code, links, images, fenced code blocks, blockquotes, ordered and unordered lists (one nesting
level), GFM tables, horizontal rules, and raw HTML blocks. Output is deterministic.

    python tools/md.py FILE.md > out.html
"""
import html
import re
import sys


def slug(text):
    t = re.sub(r'<[^>]+>', '', text).lower()
    t = re.sub(r'[^\w\- ]+', '', t, flags=re.UNICODE).strip().replace(' ', '-')
    return re.sub(r'-+', '-', t) or 'section'


_INLINE_CODE = re.compile(r'`([^`]+)`')
_LINK = re.compile(r'\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)')
_IMG = re.compile(r'!\[([^\]]*)\]\(([^)\s]+)\)')
_BOLD = re.compile(r'\*\*(.+?)\*\*')
_ITAL = re.compile(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])')
_AUTO = re.compile(r'(?<![("\'>])(https?://[^\s<)]+[^\s<).,;:])')


def inline(text, link_rewriter=None):
    out = []
    pos = 0
    # protect code spans first
    parts = []
    for m in _INLINE_CODE.finditer(text):
        parts.append(('t', text[pos:m.start()])); parts.append(('c', m.group(1))); pos = m.end()
    parts.append(('t', text[pos:]))
    for kind, seg in parts:
        if kind == 'c':
            out.append(f'<code>{html.escape(seg)}</code>'); continue
        s = html.escape(seg, quote=False)
        s = _IMG.sub(lambda m: f'<img src="{m.group(2)}" alt="{m.group(1)}" loading="lazy">', s)
        def link(m):
            href = m.group(2)
            if link_rewriter: href = link_rewriter(href)
            title = f' title="{m.group(3)}"' if m.group(3) else ''
            ext = ' rel="noopener"' if href.startswith('http') else ''
            return f'<a href="{href}"{title}{ext}>{m.group(1)}</a>'
        s = _LINK.sub(link, s)
        s = _BOLD.sub(r'<strong>\1</strong>', s)
        s = _ITAL.sub(r'<em>\1</em>', s)
        s = _AUTO.sub(lambda m: f'<a href="{m.group(1)}" rel="noopener">{m.group(1)}</a>', s)
        out.append(s)
    return ''.join(out)


ANCHOR_LABEL = 'Link to this section'


def render(md, link_rewriter=None, heading_offset=0, collect=None):
    """Render Markdown. collect, if a list, receives (level, id, text) for h2/h3."""
    lines = md.replace('\r\n', '\n').split('\n')
    out = []; i = 0; n = len(lines)
    used = {}
    def hid(text):
        base = slug(text); k = base; c = 1
        while k in used: c += 1; k = f'{base}-{c}'
        used[k] = True; return k
    para = []
    def flush():
        if para:
            out.append('<p>' + inline(' '.join(x.strip() for x in para), link_rewriter) + '</p>'); para.clear()
    while i < n:
        line = lines[i]
        if not line.strip():
            flush(); i += 1; continue
        if line.startswith('```'):
            flush(); lang = line[3:].strip(); buf = []; i += 1
            while i < n and not lines[i].startswith('```'): buf.append(lines[i]); i += 1
            i += 1
            label = f'<span class="lang">{html.escape(lang)}</span>' if lang else ''
            out.append(f'<div class="codeblock">{label}<pre><code{" class=language-" + html.escape(lang) if lang else ""}>{html.escape(chr(10).join(buf))}</code></pre></div>'); continue
        m = re.match(r'^(#{1,6})\s+(.*?)\s*#*$', line)
        if m:
            flush(); level = min(6, len(m.group(1)) + heading_offset); text = m.group(2)
            text_html = inline(text, link_rewriter); _id = hid(text)
            if collect is not None and level in (2, 3): collect.append((level, _id, re.sub(r'<[^>]+>', '', text_html)))
            anchor = f' <a class="anchor" href="#{_id}" aria-label="{html.escape(ANCHOR_LABEL)}">#</a>' if level > 1 else ''
            out.append(f'<h{level} id="{_id}">{text_html}{anchor}</h{level}>'); i += 1; continue
        if re.match(r'^(-{3,}|\*{3,}|_{3,})\s*$', line):
            flush(); out.append('<hr>'); i += 1; continue
        if line.startswith('>'):
            flush(); buf = []
            while i < n and lines[i].startswith('>'): buf.append(lines[i][1:].lstrip()); i += 1
            out.append('<blockquote>' + render('\n'.join(buf), link_rewriter, heading_offset) + '</blockquote>'); continue
        if line.lstrip().startswith('<') and not line.lstrip().startswith('<a ') and not line.lstrip().startswith('<code') and not line.lstrip().startswith('<em') and not line.lstrip().startswith('<strong'):
            flush(); buf = []
            while i < n and lines[i].strip(): buf.append(lines[i]); i += 1
            out.append('\n'.join(buf)); continue
        if '|' in line and i + 1 < n and re.match(r'^\s*\|?\s*:?-{2,}', lines[i + 1]):
            flush(); header = [c.strip() for c in line.strip().strip('|').split('|')]
            aligns = [c.strip() for c in lines[i + 1].strip().strip('|').split('|')]
            i += 2; rows = []
            while i < n and '|' in lines[i] and lines[i].strip():
                rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i += 1
            def al(j):
                a = aligns[j] if j < len(aligns) else ''
                return ' style="text-align:right"' if a.endswith(':') and not a.startswith(':') else (' style="text-align:center"' if a.startswith(':') and a.endswith(':') else '')
            th = ''.join(f'<th{al(j)}>{inline(c, link_rewriter)}</th>' for j, c in enumerate(header))
            trs = ''.join('<tr>' + ''.join(f'<td{al(j)}>{inline(c, link_rewriter)}</td>' for j, c in enumerate(r)) + '</tr>' for r in rows)
            out.append(f'<div class="table-wrap"><table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'); continue
        if re.match(r'^\s*([-*+]|\d+[.)])\s+', line):
            flush(); out.append(_list(lines, i, link_rewriter, heading_offset)[0]); i = _list(lines, i, link_rewriter, heading_offset)[1]; continue
        para.append(line); i += 1
    flush()
    return '\n'.join(out)


def _list(lines, i, link_rewriter, heading_offset):
    """Parse a list starting at line i. Returns (html, next_index). One nesting level by indentation."""
    n = len(lines); items = []; indent0 = len(lines[i]) - len(lines[i].lstrip())
    ordered = bool(re.match(r'^\s*\d+[.)]\s+', lines[i]))
    while i < n:
        line = lines[i]
        if not line.strip():
            # blank line inside a list is allowed if the next non-blank line is still a list item or indented
            j = i
            while j < n and not lines[j].strip(): j += 1
            if j < n and (re.match(r'^\s*([-*+]|\d+[.)])\s+', lines[j]) and (len(lines[j]) - len(lines[j].lstrip())) >= indent0 or (len(lines[j]) - len(lines[j].lstrip())) > indent0):
                i = j; continue
            break
        indent = len(line) - len(line.lstrip())
        m = re.match(r'^\s*([-*+]|\d+[.)])\s+(.*)$', line)
        if m and indent == indent0:
            items.append([m.group(2), []]); i += 1; continue
        if indent > indent0 and items:
            if re.match(r'^\s*([-*+]|\d+[.)])\s+', line):
                sub_html, i = _list(lines, i, link_rewriter, heading_offset); items[-1][1].append(sub_html); continue
            items[-1][0] += ' ' + line.strip(); i += 1; continue
        break
    tag = 'ol' if ordered else 'ul'
    body = ''.join(f'<li>{inline(t, link_rewriter)}{"".join(subs)}</li>' for t, subs in items)
    return f'<{tag}>{body}</{tag}>', i


if __name__ == '__main__':
    sys.stdout.write(render(open(sys.argv[1], encoding='utf-8').read()))
