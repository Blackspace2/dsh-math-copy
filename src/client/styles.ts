export const MATH_STYLES = String.raw`
[data-dsh-math-formula] {
  --dsh-math-glow: color-mix(in srgb, var(--dsw-alias-state-business-primary, #5f8cff) 42%, transparent);
  --dsh-math-glow-soft: color-mix(in srgb, var(--dsw-alias-state-business-primary, #5f8cff) 18%, transparent);
  position: relative;
  border-radius: 0.45rem;
  cursor: copy;
  outline: 1px solid transparent;
  transform-origin: center;
  transition: transform 160ms cubic-bezier(.2,.8,.2,1),
              box-shadow 180ms ease,
              background-color 180ms ease,
              outline-color 180ms ease,
              filter 180ms ease;
}

.katex[data-dsh-math-formula] {
  display: inline-block;
}

.katex-display[data-dsh-math-formula] {
  box-sizing: border-box;
  padding: 0.42rem 0.7rem;
}

.dsh-math-formula-action {
  position: absolute;
  z-index: 4;
  inset-block-start: -1.45rem;
  inset-inline-end: -0.35rem;
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l2, rgba(127, 140, 168, .32));
  border-radius: 7px;
  color: var(--dsw-alias-label-secondary, #c5cada);
  background: color-mix(in srgb, var(--dsw-specific-menu, #20232b) 84%, transparent);
  box-shadow: 0 5px 16px rgba(0, 0, 0, .2);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(2px) scale(.94);
  transition: opacity 140ms ease, transform 160ms ease;
  font: 14px/1 var(--dsw-font-sans, system-ui, sans-serif);
}

.katex-display[data-dsh-math-formula] > .dsh-math-formula-action {
  inset-block-start: 0.35rem;
  inset-inline-end: 0.45rem;
}

[data-dsh-math-formula]:hover > .dsh-math-formula-action,
[data-dsh-math-formula]:focus-within > .dsh-math-formula-action,
.dsh-math-formula-action:focus-visible {
  opacity: .92;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

.dsh-math-formula-action:hover,
.dsh-math-formula-action:focus-visible {
  outline: 2px solid var(--dsh-math-glow);
  outline-offset: 2px;
  color: var(--dsw-alias-label-primary, #f2f4f8);
}

[data-dsh-math-formula]:hover,
[data-dsh-math-formula]:focus-within,
[data-dsh-math-formula][data-dsh-math-active="true"] {
  z-index: 3;
  outline-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #5f8cff) 22%, transparent);
  background-color: color-mix(in srgb, var(--dsw-alias-fill-l1, #7f8ca8) 9%, transparent);
  box-shadow:
    0 8px 18px -10px rgba(0, 0, 0, .46),
    0 0 0 1px var(--dsh-math-glow-soft),
    0 0 18px 2px var(--dsh-math-glow-soft),
    0 6px 24px -8px var(--dsh-math-glow);
  filter: drop-shadow(0 2px 5px var(--dsh-math-glow-soft));
  transform: translateY(-3px) scale(1.012);
}

[data-dsh-math-formula]:focus-visible {
  outline-width: 2px;
  outline-offset: 3px;
}

.dsh-math-copy-menu {
  position: fixed;
  z-index: 2147483000;
  box-sizing: border-box;
  min-width: min(120px, calc(100vw - 16px));
  max-width: calc(100vw - 16px);
  padding: 6px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(127, 140, 168, .32));
  border-radius: 12px;
  color: var(--dsw-alias-label-primary, #f2f4f8);
  background: color-mix(in srgb, var(--dsw-specific-menu, #20232b) 88%, transparent);
  box-shadow: 0 16px 45px rgba(0, 0, 0, .3), 0 0 20px var(--dsh-math-menu-glow, rgba(95, 140, 255, .12));
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
  backdrop-filter: blur(18px) saturate(1.2);
  font: 13px/1.35 var(--dsw-font-sans, system-ui, sans-serif);
}

.dsh-math-copy-menu[hidden] {
  display: none;
}

.dsh-math-copy-menu__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px 9px;
  border: 0;
  border-radius: 8px;
  color: inherit;
  background: transparent;
  cursor: pointer;
  text-align: center;
  font: inherit;
}

.dsh-math-copy-menu__item:hover,
.dsh-math-copy-menu__item:focus-visible {
  outline: 0;
  background: var(--dsw-alias-fill-l2, rgba(127, 140, 168, .16));
}

.dsh-math-copy-menu__syntax {
  color: inherit;
  font-family: var(--dsw-font-mono, ui-monospace, monospace);
  font-size: 14px;
}

.dsh-math-copied-toast {
  position: fixed;
  z-index: 2147483001;
  box-sizing: border-box;
  padding: 6px 11px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary, #35c98b) 34%, transparent);
  border-radius: 9px;
  color: var(--dsw-alias-label-primary, #f2f4f8);
  background: color-mix(in srgb, var(--dsw-specific-menu, #20232b) 72%, transparent);
  box-shadow: 0 7px 22px rgba(0, 0, 0, .22), 0 0 16px rgba(53, 201, 139, .12);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, calc(-100% + 4px)) scale(.96);
  transition: opacity 140ms ease, transform 180ms cubic-bezier(.2,.8,.2,1);
  font: 600 12px/1.25 var(--dsw-font-sans, system-ui, sans-serif);
  white-space: nowrap;
}

.dsh-math-copied-toast[data-visible="true"] {
  opacity: .88;
  transform: translate(-50%, calc(-100% - 4px)) scale(1);
}

.dsh-math-copied-toast[data-kind="error"] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #ef6b73) 38%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  [data-dsh-math-formula],
  .dsh-math-copied-toast {
    transition-duration: 1ms;
  }
  [data-dsh-math-formula]:hover,
  [data-dsh-math-formula]:focus-visible,
  [data-dsh-math-formula][data-dsh-math-active="true"] {
    transform: none;
  }
}
`;
