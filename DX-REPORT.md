# Jupiter Developer Experience (DX) Report
**Project:** Jup Alpha-Trigger
**Builder:** Ra9mirez11
**Date:** May 1, 2026

## 1. Executive Summary
Jup Alpha-Trigger is a volatility monitoring dashboard that uses Jupiter's Price API V3 and Quote API V6 to detect rapid price drops and simulate automated trade execution. During the build process, we identified several critical discrepancies between the official documentation and the live implementation across multiple API versions.

## 2. Technical Findings & Friction Points

### A. Price API V3 (Major Friction)
- **Silent Deprecation of V2:** Documentation still points to `/v2`, which returns a 404 without a notice.
- **Breaking Schema Changes:** Removal of the `data` wrapper and renaming `price` to `usdPrice` is undocumented in the main portal view.
- **Symbol Handling:** Using symbols instead of mints returns a 200 OK with an empty body, which is highly misleading for debugging.

### B. Quote API V6 (Implementation Friction)
- **Complex Response for Simple Actions:** The `v6/quote` response is highly optimized for complex routing but lacks a "Simplified Mode" for developers who just want to display a quick simulation. Navigating the `routePlan` nested structure for a basic UI preview adds unnecessary overhead.
- **Simulation Helpers:** There is a lack of official utility functions to "dry-run" a quote without initiating a full transaction object, forcing developers to mock parts of the logic manually.

### C. Developer Portal
- **Broken Links:** Multiple 404s in the documentation links within `developers.jup.ag`.
- **CORS:** Lack of localhost support in Price API V3 requires proxying, increasing the barrier to entry for frontend developers.

## 3. Actionable Suggestions
1. **Schema Transparency:** Update all portal documentation to reflect the V3 root-level response and new field names.
2. **Better Error Feedback:** Return clear error messages when symbols are used instead of mints.
3. **Simplified Quote Response:** Offer an optional `simple=true` flag in the Quote API that returns a flattened object for UI previews.

## 4. Conclusion
Jupiter's APIs are world-class in performance but currently suffer from documentation lag. By fixing the versioning transparency and adding simple error messages for common developer mistakes (like using symbols), Jupiter can significantly reduce the "time-to-first-swap" for new builders.
