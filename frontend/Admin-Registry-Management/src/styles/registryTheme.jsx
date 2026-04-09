/**
 * registryTheme.jsx — Barrel re-export
 *
 * All style tokens live in their own domain files:
 *   layout.styles.js  — page, glassCard, waves, overlays, modal
 *   forms.styles.js   — labels, inputs, buttons, endpoint rows
 *   nav.styles.js     — floating top navigation bar
 *   cards.styles.js   — search bar, registry cards, state boxes
 *
 * Every component imports `{ styles }` from this file and nothing breaks.
 */

import { layout } from "./layout.styles";
import { typography, forms } from "./forms.styles";
import { nav } from "./nav.styles";
import { search, cards } from "./cards.styles";

export const styles = {
  // layout
  ...layout,
  // typography & forms
  ...typography,
  ...forms,
  // navigation
  ...nav,
  // search & cards
  ...search,
  ...cards,
};
