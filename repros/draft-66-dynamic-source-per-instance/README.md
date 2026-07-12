# draft-66 — server `dynamic()` evaluates `source()` once per instance (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). `dynamic(source)` is documented
to **share** one source evaluation across all mounted instances. The client does
— one lazy cached memo per `dynamic()` call. The **server** calls `source()`
inside the returned component, once **per instance**: N instances → N evaluations
(a 10-card dashboard triggers 10 module loads per SSR request, not 1), and a
non-idempotent source renders **different** components per instance (`A|B|A`) — a
guaranteed hydration mismatch. The client renders `A|A|A`.

Run: `npm run repro` (terminal). Renders one `dynamic()` chart 3×, counts
`source()` calls, shows the non-idempotent divergence, prints PASS/FAIL. On
beta.17 it FAILs (3 calls for 3 instances).

Issue draft: `issue-drafts/66-dynamic-source-per-instance.md`
