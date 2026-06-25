/**
 * Canonical spacing scale for the app-page layout primitives.
 *
 * Padding across `PageContainer`, `Panel`, and `Row` was historically ad hoc
 * (`px-4` vs `px-[18px]`, `py-3` vs `py-3.5` vs `py-4`). These constants
 * consolidate it into ONE documented scale so every primitive (and any future
 * one) reads consistently. New layout surfaces should reuse these rather than
 * re-deriving padding.
 *
 * The values keep the dominant existing look — the only nudge is the magic
 * `sm:px-[18px]` (18px) → `sm:px-5` (20px), the nearest Tailwind scale step, so
 * inner surfaces no longer carry an off-scale arbitrary value. Mobile keeps
 * `px-4` (16px) everywhere; the `sm:` breakpoint widens inner padding to `px-5`
 * and the outer column to `px-7`.
 *
 *   - OUTER (page column):  px-4  →  sm:px-7   horizontal
 *                           pt-6  →  sm:pt-8 , pb-16   vertical
 *   - INNER (panel/row):    px-4  →  sm:px-5   horizontal
 *   - PANEL_HEADER vertical: py-3.5  (header strip, slightly taller)
 *   - ROW vertical:          py-3    (list rows, denser)
 */

/** Outer page column: horizontal + vertical padding (responsive). */
export const PAGE_PADDING = "px-4 pb-16 pt-6 sm:px-7 sm:pt-8";

/** Shared inner horizontal padding for bordered surfaces (panel/row). */
export const INNER_PADDING_X = "px-4 sm:px-5";

/** Panel header strip: inner horizontal padding + its (taller) vertical rhythm. */
export const PANEL_HEADER_PADDING = `${INNER_PADDING_X} py-3.5`;

/** List row: inner horizontal padding + its (denser) vertical rhythm. */
export const ROW_PADDING = `${INNER_PADDING_X} py-3`;
