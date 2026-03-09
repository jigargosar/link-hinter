# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Link Hinter is a Chrome extension (Manifest V3) for keyboard-driven navigation. Press `f` to overlay hint labels on interactive elements, type the label to click. Inspired by Vimium's hint mode, built as a standalone extension.

## Commands

- `pnpm dev` — start Vite dev server
- `pnpm build` — production build
- `pnpm typecheck` — run TypeScript type checking (`tsc --noEmit`)

## Tech Stack

- TypeScript (strict), React 19, Tailwind CSS v4, Vite
- `vite-plugin-web-extension` — Chrome extension bundling
- `tabbable` — interactive element detection
- `rbush` — spatial index for bounding-rect overlap detection (layer system)
- `@types/chrome` — Chrome extension API types

## Architecture

Content script is the core — injected into pages, renders hint overlays inside Shadow DOM. Flat `src/` structure (no nested folders until features warrant them).

Spec at `docs/spec.md`. Task board at `docs/Board.md`.

## Versioning

- `src/manifest.json` and `package.json` versions must always be in sync
- Increment patch version on every manifest change (Chrome caches by version)

## Icons

- Source SVGs in `docs/spikes/icons/` (numbered variants for exploration)
- Production PNGs generated via `node scripts/generate-icons.mjs` (uses sharp)
- PNGs live in `public/icons/` (Vite copies to dist automatically)

## Chrome Extension Notes

- All hint DOM lives in Shadow DOM to isolate from page CSS
- Content script handles: element scanning, hint rendering, keystroke capture, click simulation
- Background service worker (future): tab creation for Shift+hint new-tab action
- Options page (future): settings UI bound to `chrome.storage.sync`
- Manifest changes require full extension reload in `chrome://extensions` (no HMR)
- Chrome does not support SVG icons in manifest — use PNG
