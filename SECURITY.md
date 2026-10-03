# Security and safety reporting

Cookwala data can cause machines to heat, cut and move. Treat safety issues as security
issues.

- **Recipe safety problem** (wrong temperature, missing hazard or CCP, dangerous step):
  `POST https://cookwala.ai/v1/safety-reports` or open a private security
  advisory on GitHub. Triage within 24 hours; a confirmed problem is recalled through the
  changes feed.
- **Vulnerabilities** in the specs, tools, reference hub or index (signing, auth,
  injection, event spoofing): use GitHub's private vulnerability reporting for
  amado2k5/cookwala. Please don't open public issues for these.

We follow coordinated disclosure (90 days by default, sooner when fixed).
