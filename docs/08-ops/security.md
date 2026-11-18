# Security

**Owner:** Security and Privacy Officer

## Threat model (static PWA, no backend)

| Threat              | Mitigation                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| XSS through content | Content is bundled data rendered as text (no `dangerouslySetInnerHTML`). Strict CSP            |
| Supply chain        | Small, permissive production deps. `npm audit --omit=dev` in CI must be clean (high and above) |
| Mic abuse           | Mic only on listening screens, tracks stopped on exit, audio never transmitted                 |
| Storage tampering   | Progress is self-owned and non-sensitive. The store validates its shape on load                |

## Content Security Policy

Set as a `<meta http-equiv>` in `index.html`:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
media-src 'self' blob:; connect-src 'self'; worker-src 'self'; manifest-src 'self';
object-src 'none'; base-uri 'self'; form-action 'none'
```

(`style-src 'unsafe-inline'` is needed for React inline style transforms on the SVG highway.)
Hosts that support it should also send `Permissions-Policy: microphone=(self)`, `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer`.

## Dependency audit status

- Production: `npm audit --omit=dev` shows 0 vulnerabilities (Sprint 0).
- Dev-only: glob, minimatch and picomatch ReDoS advisories in build tooling. Accepted (RAID R7) because they aren't shipped to users and are re-checked each sprint.
