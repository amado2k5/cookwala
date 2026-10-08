# Site reputation checklist (cookwala.ai)

Already in the repository: `site/.well-known/security.txt`, `SECURITY.md`, the Trust page
(`/trust/`, which carries the privacy statement), and Organization and WebSite JSON-LD in
`site/templates/layout.html`. Renew the `Expires` date in `security.txt` every year.

GitHub Pages cannot set response headers, and the site sits behind Cloudflare, so the rest is
done in accounts, not in this repository.

## Cloudflare (owner)

1. SSL/TLS: mode Full (strict), Always Use HTTPS, HSTS (`max-age=31536000; includeSubDomains`).
2. Response Header Transform Rule: `X-Content-Type-Options: nosniff`,
   `Referrer-Policy: strict-origin-when-cross-origin`,
   `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
3. DNS: enable DNSSEC. Add SPF `v=spf1 -all` and DMARC `v=DMARC1; p=reject;` if no mail is sent
   from the domain. Register the domain for several years and enable registrar lock.

## Search and browser consoles (owner)

- Google Search Console: verify the domain (DNS TXT), check Security Issues.
- Bing Webmaster Tools: import from Search Console.
- Google Safe Browsing status: https://transparencyreport.google.com/safe-browsing/search
- Microsoft: https://www.microsoft.com/wdsi/support/report-unsafe-site

## Security vendors and web filters (owner)

New `.ai` domains are often filed as "Newly Registered / Uncategorized" and blocked by school and
workplace filters. Ask for the category Technology or Reference at Cisco Talos, Fortinet FortiGuard,
Palo Alto, Broadcom Site Review, Trellix, Zscaler and Forcepoint. Check VirusTotal and use each
flagging engine's false-positive form. Claim the domain at Norton Safe Web, McAfee, Bitdefender.

## Scores people look at

Scamadviser, Trustpilot, Web of Trust: claim the profile and link to `/trust/`. Scamadviser weighs
domain age, so the score rises with time. Re-test with securityheaders.com, SSL Labs and Mozilla
Observatory after any header change.

Paid "verified safe" seals are not used by browsers or filters. Skip them.
