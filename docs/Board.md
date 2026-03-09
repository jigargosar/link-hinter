# Board

## Urgent

## InBasket

## Ready

- src/entrypoints/labeler.ts — prefix-free hint label generation
- src/entrypoints/scanner.ts — detect interactive elements in viewport
- src/entrypoints/HintOverlay.tsx — positioned hint label component
    - Labeler + keystroke capture + click action (self-contained)

## InProgress

- src/entrypoints/actions.ts — click simulation + shift/new-tab detection (F-SEL-02, F-SEL-03)
    - `clickElement(element)` — click + focus for form inputs
    - `openInNewTab(url)` — message background script to open new tab
- Re-scan on re-press of `f` (F-ACT-04) — content.tsx
- src/entrypoints/content.tsx — see docs/plan-content-file.md
- wxt- what is entry point

## Done

- wxt.config.ts — WXT framework config with React + Tailwind
- Extension icons — PNG generation from SVG source
- Shadow DOM container (F-OVR-02) — React + WXT createShadowRootUi in content.tsx

## Backlog

- Backspace to undo last typed character and re-filter hints (F-SEL-05)
