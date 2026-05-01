# Jupiter Developer Experience (DX) Report
**Project:** Jup Alpha-Trigger
**Builder:** Ra9mirez11
**Date:** May 1, 2026

## 1. Executive Summary
Jup Alpha-Trigger is a volatility monitoring dashboard that uses Jupiter's Price API V3 to detect rapid price drops and suggest automated limit orders. During the build process, we identified several critical discrepancies between the official documentation and the live V3 implementation, as well as significant friction points regarding account onboarding and CORS policies.

## 2. Technical Findings & Friction Points

### A. API Versioning & Deprecation (Major Friction)
- **The "Silent 404":** Official documentation still points to the `/v2` endpoint for price data. However, this endpoint currently returns a 404 without any "Deprecated" header or JSON error message. A developer following the docs would spend significant time debugging before realizing they must manually switch to `/v3`.
- **Breaking Schema Changes:** The transition from V2 to V3 removed the `data` wrapper object. In V3, the response is a flat map of mint addresses. This is a positive change for efficiency but is undocumented in the portal, leading to parsing errors.
- **Key Renaming:** The field `price` was renamed to `usdPrice` in V3. Again, this is undocumented in the primary Price API section of the developer portal.

### B. Data Inconsistency
- **Symbol vs. Mint:** V3 strictly requires Mint addresses. Passing a symbol (e.g., `SOL`) returns an empty 200 OK response. An error message like `{"error": "Symbol not supported, use Mint address"}` would save hours of developer time.
- **Missing Tokens:** Some tokens that are discoverable in the Jupiter Terminal/Swap UI do not consistently return data in the Price API V3 unless specific, hard-to-find mint addresses are used.

### C. Developer Portal & Security
- **Broken Links:** Multiple links in the `developers.jup.ag` portal lead to 404 pages (verified on May 1st).
- **CORS Policy:** The lack of CORS support for `localhost` in the Price API forces a backend proxy setup for every web project. While understandable for production, allowing localhost during development would drastically improve the DX for frontend-focused builders.

## 3. Actionable Suggestions
1. **Dynamic Docs:** Implement a "Live Playground" in the portal that uses the user's API key to fetch actual data.
2. **Unified Versioning:** Ensure the API version in the docs matches the live production version.
3. **Enhanced Errors:** Replace empty 200 responses with descriptive error codes when an invalid ID or Symbol is provided.

## 4. Conclusion
Jupiter's Developer Platform is powerful, but the documentation lag behind the V3 rollout creates unnecessary friction. Addressing the schema transparency and providing better error messages for symbols would make it the best-in-class platform for Solana developers.
