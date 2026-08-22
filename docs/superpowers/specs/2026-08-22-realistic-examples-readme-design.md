# Realistic examples and README design

Date: 2026-08-22  
Status: Approved for implementation planning

## Problem

`README.md` and `examples/sample_menu.js` demonstrate the API with a toy `TestObject` (Field A/B, Sum, String/Bool). That is a feature tour, not how someone would use `node-menu` in a REPL-style ops tool. The README also has an empty `## Example` heading, a dead Runnable “Live Example” link, and a full duplicate of the sample at the bottom.

## Goal

Make `README.md` and `examples/` show realistic usage: a background-jobs admin console as the primary story, plus small focused demos for custom chrome and cancel-on-Enter. No library API or behavior changes.

## Approach

**README excerpt + self-contained examples**

- README is quickstart-first with a trimmed jobs-console snippet and sample session output.
- Full scripts live under `examples/` and are the source of truth.
- API reference stays in the README but is tightened; the old mega-example block is removed.

Rejected alternatives:

- Full admin script inlined in the README (length + drift).
- Shared `examples/lib/` helper (extra indirection for three demos).

## Scope

### In scope

- Rewrite README structure (see below).
- Replace `examples/sample_menu.js` with three focused CommonJS examples.
- Remove dead Runnable Live Example and empty Example section.
- Fix `customPrompt` doc typo (“custom header” → “custom prompt”).

### Out of scope

- Changes to `lib/`, `index.js`, or TypeScript definitions.
- TypeScript examples.
- Including examples in the npm package (`files` already excludes them).
- Dev-tools REPL scenario (deferred).
- Automated tests for examples.

## README structure

1. **Title + one-liner** — console menu for REPL / ops-style Node apps.
2. **Installation** — `npm install node-menu`.
3. **Quickstart — Background jobs console**
   - How to run: `node examples/admin-jobs.js`.
   - Short excerpt: in-memory `JobStore` as `owner`; list / enqueue / cancel / stats.
   - Brief sample session (menu listing + one or two `>>` interactions).
   - Pointer to full script and related examples.
4. **Examples** — short list of the three files and what each teaches.
5. **API reference** — existing Methods section, tightened:
   - Keep signatures, parameter docs, and small per-method samples.
   - Remove duplicated full TestObject source/output at the bottom.

## Examples

All scripts use CommonJS (`require('../index')`) to match the package. No shared helper module.

### `examples/admin-jobs.js` (README story)

In-memory `JobStore` with a few seeded jobs. Job shape:

| Field | Type | Notes |
|-------|------|--------|
| `id` | number | Auto-increment |
| `name` | string | Job label |
| `priority` | number | Higher = more urgent (display only) |
| `status` | string | `queued` \| `running` \| `done` \| `cancelled` |

Menu groups via delimiters (Browse / Mutate / System):

- List jobs
- Get job by id (numeric)
- Enqueue job (string name, numeric priority)
- Cancel job (numeric id) — set `cancelled` if status is `queued` or `running`
- Stats — counts by status

Handlers are methods on the store; menu uses `owner` = store instance. Ends with `.start()`. Does not demonstrate custom header/prompt (see chrome example).

### `examples/custom-chrome.js`

Minimal 2–3 item menu focused on presentation: `.customHeader(...)` and `.customPrompt(...)` (both replace the defaults per the existing API). One simple action plus the built-in Quit path. Do not also call `disableDefaultHeader` / `disableDefaultPrompt` unless demonstrating those methods alone — `customHeader` / `customPrompt` already turn defaults off.

### `examples/cancel-job.js`

One “Start fake job” item (numeric seconds) that schedules work with `setTimeout`. `.continueCallback` clears the timeout when Enter is pressed — framed as cancelling in-flight work.

### Removed

- `examples/sample_menu.js`

## Behavior notes (examples only)

- Unknown or missing job id → clear `console.log`; menu keeps running.
- Cancel on already `done` / `cancelled` → message; no throw.
- No new argument validation beyond what `node-menu` already provides.

## Verification

- Manually run each of the three scripts and smoke-test the flows above.
- README quickstart excerpt must use the same names and APIs as `admin-jobs.js` (excerpt only, not a second full copy).

## Success criteria

- A newcomer can run `node examples/admin-jobs.js` and understand a real jobs console quickly.
- README no longer leads with TestObject / Sum / dead Runnable.
- Each example teaches one concern; no orphan toy sample.
