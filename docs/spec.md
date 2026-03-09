# Link Hinter — Chrome Extension Requirements Specification

**Version:** 1.0 Draft
**Date:** March 2026

---

## 1. Overview

Link Hinter is a single-purpose Chrome extension for keyboard-driven navigation. It overlays short character labels (hints) on interactive elements in the visible viewport, allowing the user to click any element by typing its label — no mouse required.

Inspired by Vimium's `f` / `F` hint mode, but stripped down to this one feature and built as a standalone Manifest V3 extension.

---

## 2. Core User Flow

1. User presses the activation hotkey (default: `f`).
2. The extension scans the current viewport only for all interactive elements.
3. Each element receives a hint overlay — a small label with a short character sequence (e.g. `a`, `sd`, `gf`).
4. Overlapping elements at the same position are grouped into layers. Only the topmost layer is shown initially.
5. User types characters to narrow down and select a hint.
6. On match:
   - Normal typing → click the element in the current tab.
   - Shift held while typing → open the element's link in a new tab.
7. `Space` → cycle to the next layer, revealing hints for elements hidden underneath at the same position.
8. `Escape` → dismiss all hints and exit hint mode.

---

## 3. Functional Requirements

### 3.1 Activation

| ID       | Requirement |
|----------|-------------|
| F-ACT-01 | A single configurable hotkey activates hint mode (default: `f`). |
| F-ACT-02 | The hotkey must be ignored when focus is inside a text input, textarea, contenteditable element, or any element with an active text cursor. |
| F-ACT-03 | Activating hint mode scans only the current viewport. Elements outside the viewport are never scanned or hinted. |
| F-ACT-04 | Re-pressing the activation hotkey while hint mode is active should reset/restart hint mode (re-scan). |

### 3.2 Element Detection

| ID       | Requirement |
|----------|-------------|
| F-DET-01 | The extension must detect all interactive elements in the viewport. The full list of target element types is defined in Section 4 (Element Scope). |
| F-DET-02 | An element qualifies as "in the viewport" if any part of its bounding rectangle is visible within the browser's visible area. |
| F-DET-03 | Elements that are invisible (`display: none`, `visibility: hidden`, `opacity: 0`, zero dimensions) must be excluded. |
| F-DET-04 | Elements inside iframes should be detected where cross-origin policy permits. |

### 3.3 Hint Label Generation

| ID       | Requirement |
|----------|-------------|
| F-HNT-01 | Each detected element receives a unique character sequence as its hint label. |
| F-HNT-02 | The character set used for labels is configurable (default: home-row characters `s a d f j k l e w c m p g h`). |
| F-HNT-03 | Labels should be as short as possible. A trie-based or prefix-code algorithm should distribute labels so that no label is a prefix of another, and label length scales logarithmically with element count. |
| F-HNT-04 | With `n` characters in the set and `k` elements to label, most labels should be ≤ `ceil(log_n(k))` characters long. |

### 3.4 Hint Overlay Rendering

| ID       | Requirement |
|----------|-------------|
| F-OVR-01 | Hints are rendered as small floating labels positioned at the top-left corner of their target element's bounding rect. |
| F-OVR-02 | All hint DOM elements must be injected inside a Shadow DOM container to prevent interference from page CSS. |
| F-OVR-03 | Hints must have a high z-index to appear above page content. |
| F-OVR-04 | Hint appearance (font size, text color, background color, border radius, opacity) is configurable with sensible defaults (e.g. yellow background, black text, bold monospace font, small padding). |
| F-OVR-05 | As the user types characters, hints that no longer match must be immediately hidden or visually dimmed. Matching characters within the hint should be visually distinguished (e.g. different color). |

### 3.5 Layer System (Overlap Handling)

| ID       | Requirement |
|----------|-------------|
| F-LAY-01 | After scanning, the extension must detect elements whose bounding rectangles physically overlap (intersection area > 0). |
| F-LAY-02 | Overlapping elements at the same position are grouped into a stack, ordered by visual stacking order (z-index, then DOM order). |
| F-LAY-03 | Layer 1 (default) shows hints for the topmost element in each stack, plus all non-overlapping elements. |
| F-LAY-04 | Pressing `Space` advances to the next layer. Layer 2 shows the second element in each stack, Layer 3 the third, and so on. |
| F-LAY-05 | Positions that have no element at the current layer depth simply show no hint (they don't carry over from previous layers). |
| F-LAY-06 | After the deepest layer, pressing `Space` wraps back to Layer 1. |
| F-LAY-07 | A small, non-intrusive indicator should show the current layer number (e.g. "Layer 2/4" in a corner of the viewport). |
| F-LAY-08 | Hint labels are regenerated on each layer switch so they remain optimally short for the current layer's element count. |

### 3.6 Hint Selection and Action

| ID       | Requirement |
|----------|-------------|
| F-SEL-01 | When the user's typed characters uniquely match a single hint, the action fires immediately (no Enter key needed). |
| F-SEL-02 | Default action (no Shift): Simulate a click on the target element. For links, this navigates in the current tab. For buttons, inputs, selects — trigger their native click/focus behavior. |
| F-SEL-03 | Shift action (Shift held while typing): If the target is a link (`<a href>`), open the URL in a new tab. If the target is not a link (button, input, etc.), fall back to the default click action. |
| F-SEL-04 | After a successful action, hint mode is dismissed and all overlays are removed. |
| F-SEL-05 | `Backspace` deletes the last typed character and updates the visible hints accordingly. |
| F-SEL-06 | `Escape` cancels hint mode entirely, removing all overlays. |

### 3.7 Dismissal

| ID       | Requirement |
|----------|-------------|
| F-DIS-01 | Hint mode is dismissed on: Escape keypress, successful hint selection, or page navigation. |
| F-DIS-02 | On dismissal, all hint overlays, the shadow DOM container, and the layer indicator are removed cleanly. |
| F-DIS-03 | Hint mode must not leave any residual event listeners or DOM artifacts after dismissal. |

---

## 4. Element Scope

The extension must detect all of the following element types within the viewport:

| Category               | Elements / Selectors |
|------------------------|----------------------|
| Links                  | `a[href]` |
| Buttons                | `button`, `input[type="button"]`, `input[type="submit"]`, `input[type="reset"]`, `input[type="image"]` |
| Form inputs            | `input` (all types), `textarea`, `select` |
| Clickable by role      | `[role="button"]`, `[role="link"]`, `[role="tab"]`, `[role="menuitem"]`, `[role="option"]`, `[role="checkbox"]`, `[role="radio"]`, `[role="switch"]`, `[role="combobox"]` |
| Clickable by attribute | `[onclick]`, `[tabindex]` (where tabindex ≥ 0), `[contenteditable="true"]` |
| Interactive HTML5      | `summary`, `details`, `dialog` |
| Media controls         | `video`, `audio` (the elements themselves, for triggering native controls) |
| Custom elements        | Any element with a registered click event listener (best-effort detection via `getEventListeners` where available, or heuristics such as `cursor: pointer` computed style) |

---

## 5. Configuration Options

All settings are persisted via `chrome.storage.sync` and exposed through an options page accessible from the extension icon's context menu.

| Setting                | Type         | Default     | Description |
|------------------------|--------------|-------------|-------------|
| Activation hotkey      | Key combo    | `f`         | Key(s) to enter hint mode |
| Character set          | String       | `sadfjklewcmpgh` | Characters used for generating hint labels. Order matters (first chars are preferred). |
| Hint font size         | Number (px)  | `12`        | Font size of hint labels |
| Hint text color        | Color        | `#000000`   | Hint label text color |
| Hint background color  | Color        | `#FFFF00`   | Hint label background color |
| Hint border radius     | Number (px)  | `3`         | Corner rounding of hint boxes |
| Hint opacity           | Number (0-1) | `1.0`       | Opacity of hint labels |
| Match highlight color  | Color        | `#00CC00`   | Color for already-typed matching characters in hint labels |
| Show layer indicator   | Boolean      | `true`      | Whether to show the layer counter |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID          | Requirement |
|-------------|-------------|
| NF-PERF-01  | Hint mode activation (scan + render) must complete within 100ms on a page with up to 500 interactive elements. |
| NF-PERF-02  | Keystroke filtering (hiding non-matching hints) must feel instantaneous — under 16ms (one frame). |
| NF-PERF-03  | Layer switching must complete within 50ms. |
| NF-PERF-04  | The extension must add zero runtime overhead when hint mode is not active (no polling, no mutation observers). |

### 6.2 Compatibility

| ID            | Requirement |
|---------------|-------------|
| NF-COMPAT-01  | Must work on Chrome 120+ (Manifest V3). |
| NF-COMPAT-02  | Must not break on complex web apps (Gmail, Google Docs, GitHub, Twitter, YouTube, etc.). |
| NF-COMPAT-03  | Must handle dynamically loaded content that was present at activation time. Content loaded after activation is not required to be hinted until next activation. |
| NF-COMPAT-04  | Must coexist with other extensions without conflict (isolated Shadow DOM, no global namespace pollution). |

### 6.3 Accessibility

| ID          | Requirement |
|-------------|-------------|
| NF-A11Y-01  | Hint overlays must not interfere with screen readers (use `aria-hidden="true"` on the hint container). |
| NF-A11Y-02  | Hint text must have sufficient contrast against the background (WCAG AA minimum by default). |

---

## 7. Tech Stack

### 7.1 Core

| Technology    | Role |
|---------------|------|
| TypeScript    | All source code — strict mode enabled |
| React 18+     | UI rendering for hint overlays (inside Shadow DOM) and options page |
| Tailwind CSS 4 | All styling — hint labels, options page, layer indicator |
| Vite          | Build tool and dev server |

### 7.2 Build Tooling

| Package                    | Role |
|----------------------------|------|
| `vite`                     | Bundler, dev server with HMR |
| `vite-plugin-web-extension` | Chrome extension integration — handles manifest generation, content script bundling, HMR for extension development, output structure for `chrome://extensions` loading |
| `tailwindcss`, `@tailwindcss/vite` | Tailwind CSS compilation via Vite plugin |

### 7.3 Libraries

| Package   | Role | Justification |
|-----------|------|---------------|
| `tabbable` | Detect all focusable/interactive elements in the viewport | Battle-tested, handles edge cases (disabled, visibility, aria-hidden, inert, tabindex, details/summary). Replaces hundreds of lines of custom selector logic. |
| `rbush`   | R-tree spatial index for bounding-rect overlap detection | O(n log n) overlap grouping instead of O(n²) brute-force pairwise comparison. Clean API for inserting rects and querying intersections. Essential for the layer system. |

### 7.4 Type Definitions

| Package                          | Role |
|----------------------------------|------|
| `@types/chrome`                  | Full type safety for all Chrome extension APIs (`chrome.storage`, `chrome.tabs`, `chrome.runtime`, `chrome.commands`) |
| `@types/react`, `@types/react-dom` | React type definitions |

### 7.5 Libraries Considered and Rejected

| Library | Why Rejected |
|---------|--------------|
| `webextension-polyfill` | Only needed for cross-browser (Firefox) support. Chrome-only for v1, and our Chrome API surface is small (`storage.sync`, `tabs.create`, `runtime.sendMessage`). |
| `preact` / `lit-html` | Considered as lighter alternatives to React. React chosen for consistency with options page and developer familiarity. Bundle size is acceptable for an extension. |
| State management (`zustand`, `redux`) | Overkill. React `useState` + `useContext` is sufficient for this scope. |
| CSS-in-JS (`styled-components`, `emotion`) | Tailwind covers all styling needs. No runtime CSS generation needed. |

---

## 8. Architecture

### 8.1 Project Structure

```
link-hinter/
├── public/
│   └── icons/              # Extension icons (16, 32, 48, 128px)
├── src/
│   ├── content/
│   │   ├── index.tsx        # Content script entry — mounts React into Shadow DOM
│   │   ├── App.tsx          # Root hint mode component
│   │   ├── hooks/
│   │   │   ├── useHintMode.ts       # Core state machine for hint mode
│   │   │   ├── useKeyCapture.ts     # Keystroke handling (typing, Shift, Escape, Space, Backspace)
│   │   │   └── useSettings.ts       # Reads from chrome.storage.sync, listens for changes
│   │   ├── lib/
│   │   │   ├── scanner.ts           # Element detection using tabbable + viewport filtering
│   │   │   ├── labeler.ts           # Prefix-free hint label generation (trie-based)
│   │   │   ├── layers.ts            # Overlap detection via rbush, stack grouping, layer assignment
│   │   │   └── actions.ts           # Click simulation, new-tab messaging
│   │   └── components/
│   │       ├── HintOverlay.tsx      # Individual hint label component
│   │       └── LayerIndicator.tsx   # "Layer 2/4" corner indicator
│   ├── background/
│   │   └── index.ts         # Service worker — tab creation, command listener, message relay
│   ├── options/
│   │   ├── index.html       # Options page HTML shell
│   │   ├── index.tsx        # Options page entry
│   │   └── App.tsx          # Options UI — settings form bound to chrome.storage.sync
│   ├── shared/
│   │   ├── types.ts         # Shared TypeScript types and interfaces
│   │   ├── constants.ts     # Default config values, message types
│   │   └── storage.ts       # Typed wrapper around chrome.storage.sync get/set
│   └── manifest.json        # Manifest V3 source (processed by vite-plugin-web-extension)
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### 8.2 Components

| Component                   | Entry File               | Responsibility |
|-----------------------------|--------------------------|----------------|
| Content Script              | `src/content/index.tsx`  | Injected into every page. Creates a Shadow DOM container, mounts React app inside it. Handles element scanning, hint rendering, keystroke capture, layer management, click simulation. |
| Background Service Worker   | `src/background/index.ts` | Opens new tabs via `chrome.tabs.create` on message from content script. Listens for `chrome.commands` and forwards activation to the active tab's content script. |
| Options Page                | `src/options/index.tsx`  | Settings UI built with React + Tailwind. Reads/writes `chrome.storage.sync`. Live preview of hint styling. |

### 8.3 Communication

- **Content → Background:** `chrome.runtime.sendMessage({ type: "OPEN_NEW_TAB", url })` when Shift-action targets a link.
- **Background → Content:** `chrome.tabs.sendMessage(tabId, { type: "ACTIVATE" })` when the activation command fires.
- **Options → Storage → Content:** Options page writes to `chrome.storage.sync`. Content script listens via `chrome.storage.onChanged` and updates config reactively (no page reload needed).

### 8.4 Permissions

| Permission   | Reason |
|--------------|--------|
| `activeTab`  | Access to the current tab's DOM for element scanning |
| `storage`    | Persist user configuration via `chrome.storage.sync` |
| `scripting`  | Inject content script if not declaratively loaded |

No host permissions or broad `<all_urls>` needed — `activeTab` is sufficient since the extension only acts when the user explicitly activates it.

---

## 9. Hint Label Algorithm

The label generation should follow a prefix-free code approach:

1. Determine the number of elements `k` to label.
2. Given the character set of size `n`, compute label lengths such that no label is a prefix of another (this ensures the moment a label is fully typed, it uniquely matches — no ambiguity, no need for Enter).
3. Distribute characters using a trie structure: single-character labels for the first batch, two-character for the next tier, etc.
4. Prioritize shorter labels. With 14 home-row characters, a single-character set covers 14 elements; two characters covers up to 196; three covers up to 2,744. Most pages will need at most two-character hints.

---

## 10. Overlap Detection Algorithm

1. After collecting all interactive elements in the viewport, compute each element's `getBoundingClientRect()`.
2. For each pair of elements, check if their bounding rectangles intersect (overlap area > 0 pixels).
3. Group overlapping elements into stacks using a spatial clustering approach (union-find or similar).
4. Within each stack, sort elements by visual stacking order: higher z-index first, then later DOM order first (consistent with browser paint order).
5. Assign each element a layer number within its stack (1 = topmost, 2 = next, etc.).
6. Non-overlapping elements are assigned to Layer 1 only.

---

## 11. Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No interactive elements in viewport | Show a brief "No hints" message, auto-dismiss after 1 second. |
| Single element in viewport | Show one single-character hint. |
| Element scrolls out of viewport after activation | Hint stays visible at last known position; if clicked, attempt the action anyway. |
| Page navigates during hint mode | Hint mode is dismissed automatically. |
| Element is inside a Shadow DOM on the page | Best-effort detection — scan open shadow roots. Closed shadow roots cannot be accessed. |
| Activation inside an iframe | Content script runs per-frame; hints appear within each frame independently. |
| User types characters not in the hint set | Ignored (no effect, no dismissal). |
| Very long page with hundreds of elements in viewport | Layer system keeps hint count manageable; label algorithm scales to 2-3 character hints. |
| Shift held for a non-link element (e.g. button) | Falls back to normal click behavior in current tab. |
| Contenteditable / input focused, user presses activation key | Activation key is suppressed; does not enter hint mode. |

---

## 12. Future Considerations (Out of Scope for v1)

These are explicitly not part of this version but noted for potential future work:

- Multi-key activation combos (e.g. `Ctrl+Shift+F`)
- Visual search/filter (type text to filter elements by visible label text)
- Custom per-site configurations
- Hint mode for right-click (context menu)
- Copy link URL to clipboard mode
- Hover mode (simulate mouseenter instead of click)

---

## 13. Glossary

| Term              | Definition |
|-------------------|------------|
| Hint              | A short character label overlaid on an interactive element |
| Hint mode         | The active state where hints are displayed and the extension captures keystrokes |
| Layer             | A depth level within a stack of overlapping elements at the same position |
| Stack             | A group of interactive elements whose bounding rectangles overlap at the same viewport position |
| Viewport          | The currently visible area of the browser tab (no scrolling) |
| Activation hotkey | The key that enters hint mode |
| Prefix-free code  | A labeling scheme where no label is a prefix of another, ensuring unambiguous selection |
