import { extractLatex, formatLatex, type LatexCopyFormat } from './latex.js';
import { MATH_STYLES } from './styles.js';

const FORMULA_SELECTOR = '.katex-display, .katex, .katex-error';
const ENHANCED_SELECTOR = '[data-dsh-math-formula]';
const MENU_MARGIN = 8;
const TOAST_DURATION_MS = 1250;

interface AttributeSnapshot {
  role: string | null;
  tabIndex: string | null;
  title: string | null;
  ariaLabel: string | null;
  ariaKeyShortcuts: string | null;
}

interface MenuState {
  formula: HTMLElement;
  focusTarget: HTMLElement;
  latex: string;
}

export interface MathInteractionController {
  dispose(): void;
  scan(root?: ParentNode): void;
}

function formulaFromCandidate(candidate: Element): HTMLElement | null {
  if (!(candidate instanceof HTMLElement)) return null;
  if (candidate.classList.contains('katex')) {
    const display = candidate.closest('.katex-display');
    if (display instanceof HTMLElement) return display;
  }
  return candidate;
}

function findFormula(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const enhanced = target.closest(ENHANCED_SELECTOR);
  if (enhanced instanceof HTMLElement) return enhanced;
  const candidate = target.closest(FORMULA_SELECTOR);
  return candidate === null ? null : formulaFromCandidate(candidate);
}

function createMenu(): HTMLDivElement {
  const menu = document.createElement('div');
  menu.id = 'dsh-math-copy-menu';
  menu.className = 'dsh-math-copy-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', '选择 LaTeX 复制格式');
  menu.innerHTML = `
    <button class="dsh-math-copy-menu__item" type="button" role="menuitem" data-format="single-dollar" aria-label="使用单美元分隔符复制">
      <span class="dsh-math-copy-menu__syntax" aria-hidden="true">$...$</span>
    </button>
    <button class="dsh-math-copy-menu__item" type="button" role="menuitem" data-format="double-dollar" aria-label="使用双美元分隔符复制">
      <span class="dsh-math-copy-menu__syntax" aria-hidden="true">$$...$$</span>
    </button>
    <button class="dsh-math-copy-menu__item" type="button" role="menuitem" data-format="brackets" aria-label="使用反斜线方括号分隔符复制">
      <span class="dsh-math-copy-menu__syntax" aria-hidden="true">\\[...\\]</span>
    </button>
  `;
  document.body.append(menu);
  return menu;
}

function placeMenu(menu: HTMLElement, clientX: number, clientY: number): void {
  menu.style.left = `${clientX}px`;
  menu.style.top = `${clientY}px`;
  const rect = menu.getBoundingClientRect();
  const left = Math.max(MENU_MARGIN, Math.min(clientX, window.innerWidth - rect.width - MENU_MARGIN));
  const top = Math.max(MENU_MARGIN, Math.min(clientY, window.innerHeight - rect.height - MENU_MARGIN));
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

function selectionInside(formula: HTMLElement): boolean {
  const selection = window.getSelection();
  if (selection === null || selection.isCollapsed) return false;
  return (selection.anchorNode !== null && formula.contains(selection.anchorNode))
    || (selection.focusNode !== null && formula.contains(selection.focusNode));
}

async function fallbackClipboardWrite(text: string): Promise<void> {
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = window.getSelection();
  const ranges: Range[] = [];
  if (selection !== null) {
    for (let index = 0; index < selection.rangeCount; index += 1) {
      ranges.push(selection.getRangeAt(index).cloneRange());
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = typeof document.execCommand === 'function' && document.execCommand('copy');
  } finally {
    textarea.remove();
    active?.focus({ preventScroll: true });
    if (selection !== null) {
      selection.removeAllRanges();
      for (const range of ranges) selection.addRange(range);
    }
  }
  if (!copied) throw new Error('Clipboard API is unavailable');
}

export async function writeClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText !== undefined) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Permission failures still get the legacy same-gesture fallback.
  }
  await fallbackClipboardWrite(text);
}

/** Install all DOM-level behavior. Returning dispose makes it safe under DSH HMR. */
export function installMathInteractions(): MathInteractionController {
  const snapshots = new Map<HTMLElement, AttributeSnapshot>();
  const actionButtons = new Map<HTMLElement, HTMLButtonElement>();
  let disposed = false;
  let menuState: MenuState | null = null;
  let toast: HTMLDivElement | null = null;
  let toastHideTimer: ReturnType<typeof setTimeout> | undefined;
  let toastRemoveTimer: ReturnType<typeof setTimeout> | undefined;

  const style = document.createElement('style');
  style.dataset.plugin = 'dsh-math-copy';
  style.dataset.pluginCss = 'dsh-math-copy/styles';
  style.textContent = MATH_STYLES;
  document.head.append(style);

  const menu = createMenu();

  const enhance = (formula: HTMLElement): void => {
    if (formula.hasAttribute('data-dsh-math-formula')) return;
    snapshots.set(formula, {
      role: formula.getAttribute('role'),
      tabIndex: formula.getAttribute('tabindex'),
      title: formula.getAttribute('title'),
      ariaLabel: formula.getAttribute('aria-label'),
      ariaKeyShortcuts: formula.getAttribute('aria-keyshortcuts'),
    });
    formula.setAttribute('data-dsh-math-formula', '');
    if (!formula.hasAttribute('title')) {
      formula.setAttribute('title', '单击复制 $$LaTeX$$；右键选择格式');
    }

    // Keep KaTeX's MathML exposed to assistive technology. A separate native
    // button provides keyboard access without turning MathML into button text.
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'dsh-math-formula-action';
    action.dataset.dshMathAction = '';
    action.setAttribute('aria-label', '复制 LaTeX / Copy LaTeX');
    action.setAttribute('aria-haspopup', 'menu');
    action.setAttribute('aria-expanded', 'false');
    action.setAttribute('aria-controls', 'dsh-math-copy-menu');
    action.setAttribute('aria-keyshortcuts', 'Enter Shift+F10');
    action.title = '复制 LaTeX；右键或 Shift+F10 选择格式';
    action.innerHTML = '<span aria-hidden="true">⧉</span>';
    formula.append(action);
    actionButtons.set(formula, action);
  };

  const scan = (root: ParentNode = document): void => {
    if (disposed) return;
    if (root instanceof Element && root.matches(FORMULA_SELECTOR)) {
      const formula = formulaFromCandidate(root);
      if (formula !== null) enhance(formula);
    }
    for (const candidate of root.querySelectorAll(FORMULA_SELECTOR)) {
      const formula = formulaFromCandidate(candidate);
      if (formula !== null) enhance(formula);
    }
  };

  const closeMenu = (restoreFocus = false): void => {
    const state = menuState;
    if (state !== null) {
      state.formula.removeAttribute('data-dsh-math-active');
      state.focusTarget.setAttribute('aria-expanded', 'false');
    }
    menuState = null;
    menu.hidden = true;
    if (restoreFocus) state?.focusTarget.focus({ preventScroll: true });
  };

  const openMenu = (formula: HTMLElement, latex: string, x: number, y: number): void => {
    closeMenu(false);
    const focusTarget = actionButtons.get(formula) ?? formula;
    menuState = { formula, focusTarget, latex };
    formula.setAttribute('data-dsh-math-active', 'true');
    focusTarget.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    placeMenu(menu, x, y);
    menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
  };

  const clearToast = (): void => {
    if (toastHideTimer !== undefined) clearTimeout(toastHideTimer);
    if (toastRemoveTimer !== undefined) clearTimeout(toastRemoveTimer);
    toastHideTimer = undefined;
    toastRemoveTimer = undefined;
    toast?.remove();
    toast = null;
  };

  const showToast = (formula: HTMLElement, ok: boolean): void => {
    clearToast();
    const rect = formula.getBoundingClientRect();
    const next = document.createElement('div');
    next.className = 'dsh-math-copied-toast';
    next.setAttribute('role', ok ? 'status' : 'alert');
    next.dataset.kind = ok ? 'success' : 'error';
    next.textContent = ok ? 'Copied ✓' : 'Copy failed ×';
    next.style.left = `${Math.max(52, Math.min(window.innerWidth - 52, rect.left + rect.width / 2))}px`;
    next.style.top = `${Math.max(34, rect.top - 5)}px`;
    document.body.append(next);
    toast = next;
    requestAnimationFrame(() => {
      if (toast === next) next.dataset.visible = 'true';
    });
    toastHideTimer = setTimeout(() => {
      next.dataset.visible = 'false';
      toastRemoveTimer = setTimeout(() => {
        if (toast === next) toast = null;
        next.remove();
      }, 190);
    }, TOAST_DURATION_MS);
  };

  const copy = async (formula: HTMLElement, source: string, format: LatexCopyFormat): Promise<void> => {
    try {
      await writeClipboard(formatLatex(source, format));
      showToast(formula, true);
    } catch {
      showToast(formula, false);
    }
  };

  const onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const formula = findFormula(event.target);
    if (formula === null || selectionInside(formula)) return;
    const latex = extractLatex(formula);
    if (latex === null) return;
    event.preventDefault();
    void copy(formula, latex, 'double-dollar');
  };

  const onContextMenu = (event: MouseEvent): void => {
    const formula = findFormula(event.target);
    if (formula === null) return;
    const latex = extractLatex(formula);
    if (latex === null) return;
    event.preventDefault();
    event.stopPropagation();
    openMenu(formula, latex, event.clientX, event.clientY);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) return;
    if (!menu.hidden) {
      const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')];
      const current = items.indexOf(document.activeElement as HTMLElement);
      if (event.key === 'Escape' || event.key === 'Tab') {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && items.length > 0) {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        items[(current + step + items.length) % items.length]?.focus();
        return;
      }
    }

    const formula = findFormula(event.target);
    if (formula === null) return;
    const latex = extractLatex(formula);
    if (latex === null) return;
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.target instanceof Element && event.target.closest('[data-dsh-math-action]') !== null) return;
      event.preventDefault();
      void copy(formula, latex, 'double-dollar');
    } else if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
      event.preventDefault();
      const rect = formula.getBoundingClientRect();
      openMenu(formula, latex, rect.left + rect.width / 2, rect.bottom + 6);
    }
  };

  const onMenuClick = (event: MouseEvent): void => {
    const button = event.target instanceof Element
      ? event.target.closest<HTMLButtonElement>('[data-format]')
      : null;
    if (button === null || menuState === null) return;
    const format = button.dataset.format as LatexCopyFormat;
    const { formula, latex } = menuState;
    event.preventDefault();
    event.stopPropagation();
    closeMenu(true);
    void copy(formula, latex, format);
  };

  const onPointerDown = (event: Event): void => {
    if (menu.hidden || (event.target instanceof Node && menu.contains(event.target))) return;
    closeMenu(false);
  };

  const onViewportChange = (): void => closeMenu(false);
  const onWindowBlur = (): void => closeMenu(false);

  document.addEventListener('click', onClick);
  document.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('pointerdown', onPointerDown, true);
  menu.addEventListener('click', onMenuClick);
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('blur', onWindowBlur);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) scan(node);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  scan();

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    document.removeEventListener('click', onClick);
    document.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('pointerdown', onPointerDown, true);
    menu.removeEventListener('click', onMenuClick);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    window.removeEventListener('blur', onWindowBlur);
    closeMenu(false);
    clearToast();
    menu.remove();
    style.remove();
    for (const [formula, snapshot] of snapshots) {
      actionButtons.get(formula)?.remove();
      formula.removeAttribute('data-dsh-math-formula');
      formula.removeAttribute('data-dsh-math-active');
      restoreAttribute(formula, 'role', snapshot.role);
      restoreAttribute(formula, 'tabindex', snapshot.tabIndex);
      restoreAttribute(formula, 'title', snapshot.title);
      restoreAttribute(formula, 'aria-label', snapshot.ariaLabel);
      restoreAttribute(formula, 'aria-keyshortcuts', snapshot.ariaKeyShortcuts);
    }
    snapshots.clear();
    actionButtons.clear();
  };

  return { dispose, scan };
}

function restoreAttribute(element: HTMLElement, name: string, value: string | null): void {
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}
