# Security policy

Cookwala data can cause machines to heat, cut and move, so security problems can become
physical safety problems. Treat safety issues as security issues, and report them privately.

## Report a vulnerability

- Use GitHub's private vulnerability reporting on
  [amado2k5/cookwala](https://github.com/amado2k5/cookwala/security/advisories/new).
- Include what is affected (spec section, schema, tool, website), how to reproduce it, and
  the impact you see.
- We acknowledge within 3 working days and agree a disclosure date with you. The default
  is 90 days, or sooner once a fix ships.

## In scope

- Ways to make a conforming executor exceed its safety limits or skip a refusal.
- Signature, hash, key-revocation, disclosure or event-log weaknesses (`tools/cookwala_ref.py`,
  `docs/CORE.md` section 5).
- Prompt-injection paths through recipe text, notes or listings that the Core rules don't
  cover (`docs/CORE.md` section 6).
- Privacy leaks: personal data that can travel despite the Core and Humanitarian rules.
- The cookwala.ai website and its published files.

## Unsafe recipes

A wrong temperature, a missing hazard or critical control point, or a dangerous step in an
index recipe is a safety problem. Report it through GitHub's private vulnerability reporting
(or an `IncidentReport` to `POST /v1/incidents` once the catalog service is live). We triage
within 24 hours. Confirmed problems are withdrawn through the signed recall feed
(`GET /v1/recalls`).

## Supported versions

Cookwala Core 0.2.x. Earlier drafts get no fixes.
