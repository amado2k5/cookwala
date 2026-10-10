# Search engine submission checklist: cookwala.ai

Manual steps for the site owner. Nothing here is automated except IndexNow, which runs after every deploy.

## Sitemaps

Submit the index; the consoles discover the per-language files from it. List them separately where a console asks for each one.

| Sitemap | Contents |
|---|---|
| https://cookwala.ai/sitemap.xml | Index of the files below (also named in https://cookwala.ai/robots.txt) |
| https://cookwala.ai/sitemap-en.xml | English pages |
| https://cookwala.ai/sitemap-ar.xml | Arabic pages |
| https://cookwala.ai/sitemap-de.xml | German pages (machine-translated) |
| https://cookwala.ai/sitemap-es.xml | Spanish pages (machine-translated) |
| https://cookwala.ai/sitemap-fr.xml | French pages (machine-translated) |
| https://cookwala.ai/sitemap-pt.xml | Portuguese pages (machine-translated) |

A language added under `site/content/<lang>/` gets its own `sitemap-<lang>.xml` at the next build.

## Consoles

- [ ] Google Search Console (https://search.google.com/search-console): add the domain property `cookwala.ai` (DNS TXT record), submit `sitemap.xml`
- [ ] Bing Webmaster Tools (https://www.bing.com/webmasters): import from Search Console or verify by DNS, submit `sitemap.xml`. Bing's index also feeds DuckDuckGo, Ecosia, Yahoo and Qwant
- [ ] Yandex Webmaster (https://webmaster.yandex.com): verify by DNS or meta tag, submit `sitemap.xml`
- [ ] Naver Search Advisor (https://searchadvisor.naver.com): verify, submit `sitemap.xml`
- [ ] Baidu Ziyuan (https://ziyuan.baidu.com): needs a Chinese mobile number. cookwala.ai has no Chinese pages yet, so this one can wait

## IndexNow

- Key file: https://cookwala.ai/2d4d91dfaa0ad91c77bf2055b28ba4ed.txt
- After each deploy of `main`, the `indexnow` job in `.github/workflows/pages.yml` compares the built pages with the live
  `https://cookwala.ai/indexnow-manifest.json` and sends only changed or new URLs (`tools/indexnow.py`). The first deploy
  sends nothing, because there is no live manifest to compare against yet.
- Engines that honour IndexNow: Bing, Yandex, Naver, Seznam. No console registration is needed for it, but Bing Webmaster Tools shows the submissions.
