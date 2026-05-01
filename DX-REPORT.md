# Jupiter Developer Experience (DX) Report
**Project:** Jup Alpha-Trigger
**Builder:** Ra9mirez11
**Date:** May 1, 2026

## 1. Executive Summary
Jup Alpha-Trigger is a volatility monitoring dashboard that uses Jupiter's Price API V3 and Quote API V6 to detect rapid price drops and simulate automated trade execution. During the build process, we identified several critical discrepancies between the official documentation and the live implementation.

## 2. Technical Findings & Friction Points

### A. Price API V3 (Major Friction)
- **Silent Deprecation of V2:** Documentation still points to `/v2`, which returns a 404.
- **Breaking Schema Changes:** Removal of the `data` wrapper and renaming `price` to `usdPrice` is undocumented in the main portal view.
- **CORS Limitations:** No support for `localhost`, requiring a backend proxy for development.

### B. Quote API V6 (Critical Discovery)
- **CORS Restricted:** Like the Price API, the Quote API V6 (quote-api.jup.ag) strictly blocks CORS requests from `localhost`. This forces developers to implement a backend proxy even for simple trade simulations or price comparisons. This significantly increases the barrier to entry for rapid prototyping in the browser.
- **Complex Response Structure:** The `routePlan` nested structure in the V6 response is powerful for aggregators but overkill for simple applications, adding overhead for parsing basic quote data.

### C. Developer Portal
- **Broken Links:** Multiple documentation links within `developers.jup.ag` lead to 404 pages (verified on May 1st).

## 3. Actionable Suggestions
1. **Developer-Friendly CORS:** Allow `localhost` or providing a dedicated developer environment with relaxed CORS rules for rapid prototyping.
2. **Unified Documentation:** Synchronize API rollouts with documentation updates to prevent "Silent 404" errors.
3. **Error Transparency:** Provide clear JSON error messages when symbols are used instead of mints, rather than empty responses.

## 4. Conclusion
Jupiter's APIs are functionally superior, but the high level of friction in the developer experience (lack of CORS, documentation lag) makes them harder to adopt than alternatives. Fixing these small but impactful issues will secure Jupiter's position as the primary platform for Solana developers.
