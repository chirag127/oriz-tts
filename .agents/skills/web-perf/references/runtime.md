# Runtime Analysis — Trace, CWV, Network, Accessibility

## Phase 1: Performance Trace

1. Navigate to the target URL:
   ```
   navigate_page(url: "<target-url>")
   ```

2. Start a performance trace with reload to capture cold-load metrics:
   ```
   performance_start_trace(autoStop: true, reload: true)
   ```

3. Wait for trace completion, then retrieve results.

**Troubleshooting:**

- If trace returns empty or fails, verify the page loaded correctly with `navigate_page` first
- If insight names don't match, inspect the trace response to list available insights

## Phase 2: Core Web Vitals Analysis

Use `performance_analyze_insight` to extract key metrics.

**Note:** Insight names may vary across Chrome DevTools versions. If an insight name doesn't work, check the `insightSetId` from the trace response to discover available insights.

Common insight names:

| Metric               | Insight Name              | What to Look For                                                                         |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| LCP                  | `LCPBreakdown`            | Time to largest contentful paint; breakdown of TTFB, resource load, render delay         |
| CLS                  | `CLSCulprits`             | Elements causing layout shifts (images without dimensions, injected content, font swaps) |
| Render Blocking      | `RenderBlocking`          | CSS/JS blocking first paint                                                              |
| Document Latency     | `DocumentLatency`         | Server response time issues                                                              |
| Network Dependencies | `NetworkRequestsDepGraph` | Request chains delaying critical resources                                               |

Example:

```
performance_analyze_insight(insightSetId: "<id-from-trace>", insightName: "LCPBreakdown")
```

**Key thresholds (good/needs-improvement/poor):**

- TTFB: < 800ms / < 1.8s / > 1.8s
- FCP: < 1.8s / < 3s / > 3s
- LCP: < 2.5s / < 4s / > 4s
- INP: < 200ms / < 500ms / > 500ms
- TBT: < 200ms / < 600ms / > 600ms
- CLS: < 0.1 / < 0.25 / > 0.25
- Speed Index: < 3.4s / < 5.8s / > 5.8s

## Phase 3: Network Analysis

List all network requests to identify optimization opportunities:

```
list_network_requests(resourceTypes: ["Script", "Stylesheet", "Document", "Font", "Image"])
```

**Look for:**

1. **Render-blocking resources**: JS/CSS in `<head>` without `async`/`defer`/`media` attributes
2. **Network chains**: Resources discovered late because they depend on other resources loading first (e.g., CSS imports, JS-loaded fonts)
3. **Missing preloads**: Critical resources (fonts, hero images, key scripts) not preloaded
4. **Caching issues**: Missing or weak `Cache-Control`, `ETag`, or `Last-Modified` headers
5. **Large payloads**: Uncompressed or oversized JS/CSS bundles
6. **Unused preconnects**: If flagged, verify by checking if ANY requests went to that origin. If zero requests, it's definitively unused—recommend removal. If requests exist but loaded late, the preconnect may still be valuable.

For detailed request info:

```
get_network_request(reqid: <id>)
```

## Phase 4: Accessibility Snapshot

Take an accessibility tree snapshot:

```
take_snapshot(verbose: true)
```

**Flag high-level gaps:**

- Missing or duplicate ARIA IDs
- Elements with poor contrast ratios (check against WCAG AA: 4.5:1 for normal text, 3:1 for large text)
- Focus traps or missing focus indicators
- Interactive elements without accessible names
