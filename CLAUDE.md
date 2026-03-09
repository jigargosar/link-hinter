# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Link Hinter is a Chrome extension (Manifest V3) for keyboard-driven navigation. Press `f` to overlay hint labels on interactive elements, type the label to click. Inspired by Vimium's hint mode, built as a standalone extension.

## Commands

- `pnpm dev` — start WXT dev server (auto-reloads content scripts on save, refresh page to see changes)
- `pnpm build` — production build (output: `.output/chrome-mv3/`)
- `pnpm typecheck` — run TypeScript type checking (`tsc --noEmit`)

## Tech Stack

- TypeScript (strict), React 19, Tailwind CSS v4, Vite (via WXT)
- `wxt` — Chrome extension framework with auto-reload dev server
- `tabbable` — interactive element detection
- `rbush` — spatial index for bounding-rect overlap detection (layer system)

## Architecture

WXT file-based entrypoints in `src/entrypoints/`. Manifest auto-generated from `wxt.config.ts`. Config in `wxt.config.ts`.

- `src/entrypoints/content.ts` — content script (hint mode)
- `src/entrypoints/background.ts` — service worker (future)
- `src/entrypoints/options/` — options page (future)

Spec at `docs/spec.md`. Task board at `docs/Board.md`.

## Versioning

- Version lives in `package.json` — WXT reads it automatically for manifest
- No separate manifest version to maintain

## Icons

- Source SVGs in `docs/spikes/icons/` (numbered variants for exploration)
- Production PNGs generated via `node scripts/generate-icons.mjs` (uses sharp)
- PNGs live in `public/icons/` (WXT copies to output automatically)

## Chrome Extension Notes

- Content script handles: element scanning, hint rendering, keystroke capture, click simulation
- Dev workflow: save file → WXT auto-reloads extension → refresh page (F5)
- Load `.output/chrome-mv3-dev/` as unpacked extension in `chrome://extensions` during dev
- Chrome does not support SVG icons in manifest — use PNG
