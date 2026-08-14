window.__ModuleLoader__.load({
  id: "math-copy",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    
    // src/client/index.ts
    var index_exports = {};
    __export(index_exports, {
      apply: () => apply,
      extractLatex: () => extractLatex,
      formatLatex: () => formatLatex,
      inject: () => inject,
      installMathInteractions: () => installMathInteractions,
      normalizeLatex: () => normalizeLatex,
      writeClipboard: () => writeClipboard
    });
    module.exports = __toCommonJS(index_exports);
    
    // src/client/latex.ts
    function normalizeLatex(source) {
      return source.replace(/\r\n?/g, "\n").trim();
    }
    function formatLatex(source, format) {
      const latex = normalizeLatex(source);
      switch (format) {
        case "single-dollar":
          return `$${latex}$`;
        case "double-dollar":
          return `$$${latex}$$`;
        case "brackets":
          return `\\[${latex}\\]`;
      }
    }
    function extractLatex(formula) {
      const annotation = formula.querySelector('annotation[encoding="application/x-tex"]') ?? formula.querySelector(".katex-mathml annotation");
      const source = annotation?.textContent ?? (formula.classList.contains("katex-error") ? formula.textContent : null);
      if (source === null) return null;
      const normalized = normalizeLatex(source);
      return normalized.length > 0 ? normalized : null;
    }
    
    // src/client/styles.ts
    var MATH_STYLES = String.raw`
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
    
    // src/client/dom.ts
    var FORMULA_SELECTOR = ".katex-display, .katex, .katex-error";
    var ENHANCED_SELECTOR = "[data-dsh-math-formula]";
    var MENU_MARGIN = 8;
    var TOAST_DURATION_MS = 1250;
    function formulaFromCandidate(candidate) {
      if (!(candidate instanceof HTMLElement)) return null;
      if (candidate.classList.contains("katex")) {
        const display = candidate.closest(".katex-display");
        if (display instanceof HTMLElement) return display;
      }
      return candidate;
    }
    function findFormula(target) {
      if (!(target instanceof Element)) return null;
      const enhanced = target.closest(ENHANCED_SELECTOR);
      if (enhanced instanceof HTMLElement) return enhanced;
      const candidate = target.closest(FORMULA_SELECTOR);
      return candidate === null ? null : formulaFromCandidate(candidate);
    }
    function createMenu() {
      const menu = document.createElement("div");
      menu.id = "dsh-math-copy-menu";
      menu.className = "dsh-math-copy-menu";
      menu.hidden = true;
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-label", "\u9009\u62E9 LaTeX \u590D\u5236\u683C\u5F0F");
      menu.innerHTML = `
        <button class="dsh-math-copy-menu__item" type="button" role="menuitem" data-format="single-dollar" aria-label="\u4F7F\u7528\u5355\u7F8E\u5143\u5206\u9694\u7B26\u590D\u5236">
          <span class="dsh-math-copy-menu__syntax" aria-hidden="true">$...$</span>
        </button>
        <button class="dsh-math-copy-menu__item" type="button" role="menuitem" data-format="double-dollar" aria-label="\u4F7F\u7528\u53CC\u7F8E\u5143\u5206\u9694\u7B26\u590D\u5236">
          <span class="dsh-math-copy-menu__syntax" aria-hidden="true">$$...$$</span>
        </button>
        <button class="dsh-math-copy-menu__item" type="button" role="menuitem" data-format="brackets" aria-label="\u4F7F\u7528\u53CD\u659C\u7EBF\u65B9\u62EC\u53F7\u5206\u9694\u7B26\u590D\u5236">
          <span class="dsh-math-copy-menu__syntax" aria-hidden="true">\\[...\\]</span>
        </button>
      `;
      document.body.append(menu);
      return menu;
    }
    function placeMenu(menu, clientX, clientY) {
      menu.style.left = `${clientX}px`;
      menu.style.top = `${clientY}px`;
      const rect = menu.getBoundingClientRect();
      const left = Math.max(MENU_MARGIN, Math.min(clientX, window.innerWidth - rect.width - MENU_MARGIN));
      const top = Math.max(MENU_MARGIN, Math.min(clientY, window.innerHeight - rect.height - MENU_MARGIN));
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    }
    function selectionInside(formula) {
      const selection = window.getSelection();
      if (selection === null || selection.isCollapsed) return false;
      return selection.anchorNode !== null && formula.contains(selection.anchorNode) || selection.focusNode !== null && formula.contains(selection.focusNode);
    }
    async function fallbackClipboardWrite(text) {
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const selection = window.getSelection();
      const ranges = [];
      if (selection !== null) {
        for (let index = 0; index < selection.rangeCount; index += 1) {
          ranges.push(selection.getRangeAt(index).cloneRange());
        }
      }
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      let copied = false;
      try {
        copied = typeof document.execCommand === "function" && document.execCommand("copy");
      } finally {
        textarea.remove();
        active?.focus({ preventScroll: true });
        if (selection !== null) {
          selection.removeAllRanges();
          for (const range of ranges) selection.addRange(range);
        }
      }
      if (!copied) throw new Error("Clipboard API is unavailable");
    }
    async function writeClipboard(text) {
      try {
        if (navigator.clipboard?.writeText !== void 0) {
          await navigator.clipboard.writeText(text);
          return;
        }
      } catch {
      }
      await fallbackClipboardWrite(text);
    }
    function installMathInteractions() {
      const snapshots = /* @__PURE__ */ new Map();
      const actionButtons = /* @__PURE__ */ new Map();
      let disposed = false;
      let menuState = null;
      let toast = null;
      let toastHideTimer;
      let toastRemoveTimer;
      const style = document.createElement("style");
      style.dataset.plugin = "dsh-math-copy";
      style.dataset.pluginCss = "dsh-math-copy/styles";
      style.textContent = MATH_STYLES;
      document.head.append(style);
      const menu = createMenu();
      const enhance = (formula) => {
        if (formula.hasAttribute("data-dsh-math-formula")) return;
        snapshots.set(formula, {
          role: formula.getAttribute("role"),
          tabIndex: formula.getAttribute("tabindex"),
          title: formula.getAttribute("title"),
          ariaLabel: formula.getAttribute("aria-label"),
          ariaKeyShortcuts: formula.getAttribute("aria-keyshortcuts")
        });
        formula.setAttribute("data-dsh-math-formula", "");
        if (!formula.hasAttribute("title")) {
          formula.setAttribute("title", "\u5355\u51FB\u590D\u5236 $$LaTeX$$\uFF1B\u53F3\u952E\u9009\u62E9\u683C\u5F0F");
        }
        const action = document.createElement("button");
        action.type = "button";
        action.className = "dsh-math-formula-action";
        action.dataset.dshMathAction = "";
        action.setAttribute("aria-label", "\u590D\u5236 LaTeX / Copy LaTeX");
        action.setAttribute("aria-haspopup", "menu");
        action.setAttribute("aria-expanded", "false");
        action.setAttribute("aria-controls", "dsh-math-copy-menu");
        action.setAttribute("aria-keyshortcuts", "Enter Shift+F10");
        action.title = "\u590D\u5236 LaTeX\uFF1B\u53F3\u952E\u6216 Shift+F10 \u9009\u62E9\u683C\u5F0F";
        action.innerHTML = '<span aria-hidden="true">\u29C9</span>';
        formula.append(action);
        actionButtons.set(formula, action);
      };
      const scan = (root = document) => {
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
      const closeMenu = (restoreFocus = false) => {
        const state = menuState;
        if (state !== null) {
          state.formula.removeAttribute("data-dsh-math-active");
          state.focusTarget.setAttribute("aria-expanded", "false");
        }
        menuState = null;
        menu.hidden = true;
        if (restoreFocus) state?.focusTarget.focus({ preventScroll: true });
      };
      const openMenu = (formula, latex, x, y) => {
        closeMenu(false);
        const focusTarget = actionButtons.get(formula) ?? formula;
        menuState = { formula, focusTarget, latex };
        formula.setAttribute("data-dsh-math-active", "true");
        focusTarget.setAttribute("aria-expanded", "true");
        menu.hidden = false;
        placeMenu(menu, x, y);
        menu.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
      };
      const clearToast = () => {
        if (toastHideTimer !== void 0) clearTimeout(toastHideTimer);
        if (toastRemoveTimer !== void 0) clearTimeout(toastRemoveTimer);
        toastHideTimer = void 0;
        toastRemoveTimer = void 0;
        toast?.remove();
        toast = null;
      };
      const showToast = (formula, ok) => {
        clearToast();
        const rect = formula.getBoundingClientRect();
        const next = document.createElement("div");
        next.className = "dsh-math-copied-toast";
        next.setAttribute("role", ok ? "status" : "alert");
        next.dataset.kind = ok ? "success" : "error";
        next.textContent = ok ? "Copied \u2713" : "Copy failed \xD7";
        next.style.left = `${Math.max(52, Math.min(window.innerWidth - 52, rect.left + rect.width / 2))}px`;
        next.style.top = `${Math.max(34, rect.top - 5)}px`;
        document.body.append(next);
        toast = next;
        requestAnimationFrame(() => {
          if (toast === next) next.dataset.visible = "true";
        });
        toastHideTimer = setTimeout(() => {
          next.dataset.visible = "false";
          toastRemoveTimer = setTimeout(() => {
            if (toast === next) toast = null;
            next.remove();
          }, 190);
        }, TOAST_DURATION_MS);
      };
      const copy = async (formula, source, format) => {
        try {
          await writeClipboard(formatLatex(source, format));
          showToast(formula, true);
        } catch {
          showToast(formula, false);
        }
      };
      const onClick = (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
        const formula = findFormula(event.target);
        if (formula === null || selectionInside(formula)) return;
        const latex = extractLatex(formula);
        if (latex === null) return;
        event.preventDefault();
        void copy(formula, latex, "double-dollar");
      };
      const onContextMenu = (event) => {
        const formula = findFormula(event.target);
        if (formula === null) return;
        const latex = extractLatex(formula);
        if (latex === null) return;
        event.preventDefault();
        event.stopPropagation();
        openMenu(formula, latex, event.clientX, event.clientY);
      };
      const onKeyDown = (event) => {
        if (event.repeat && (event.key === "Enter" || event.key === " ")) return;
        if (!menu.hidden) {
          const items = [...menu.querySelectorAll('[role="menuitem"]')];
          const current = items.indexOf(document.activeElement);
          if (event.key === "Escape" || event.key === "Tab") {
            event.preventDefault();
            closeMenu(true);
            return;
          }
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length > 0) {
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            items[(current + step + items.length) % items.length]?.focus();
            return;
          }
        }
        const formula = findFormula(event.target);
        if (formula === null) return;
        const latex = extractLatex(formula);
        if (latex === null) return;
        if (event.key === "Enter" || event.key === " ") {
          if (event.target instanceof Element && event.target.closest("[data-dsh-math-action]") !== null) return;
          event.preventDefault();
          void copy(formula, latex, "double-dollar");
        } else if (event.key === "ContextMenu" || event.shiftKey && event.key === "F10") {
          event.preventDefault();
          const rect = formula.getBoundingClientRect();
          openMenu(formula, latex, rect.left + rect.width / 2, rect.bottom + 6);
        }
      };
      const onMenuClick = (event) => {
        const button = event.target instanceof Element ? event.target.closest("[data-format]") : null;
        if (button === null || menuState === null) return;
        const format = button.dataset.format;
        const { formula, latex } = menuState;
        event.preventDefault();
        event.stopPropagation();
        closeMenu(true);
        void copy(formula, latex, format);
      };
      const onPointerDown = (event) => {
        if (menu.hidden || event.target instanceof Node && menu.contains(event.target)) return;
        closeMenu(false);
      };
      const onViewportChange = () => closeMenu(false);
      const onWindowBlur = () => closeMenu(false);
      document.addEventListener("click", onClick);
      document.addEventListener("contextmenu", onContextMenu);
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("pointerdown", onPointerDown, true);
      menu.addEventListener("click", onMenuClick);
      window.addEventListener("resize", onViewportChange);
      window.addEventListener("scroll", onViewportChange, true);
      window.addEventListener("blur", onWindowBlur);
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node instanceof Element) scan(node);
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      scan();
      const dispose = () => {
        if (disposed) return;
        disposed = true;
        observer.disconnect();
        document.removeEventListener("click", onClick);
        document.removeEventListener("contextmenu", onContextMenu);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("pointerdown", onPointerDown, true);
        menu.removeEventListener("click", onMenuClick);
        window.removeEventListener("resize", onViewportChange);
        window.removeEventListener("scroll", onViewportChange, true);
        window.removeEventListener("blur", onWindowBlur);
        closeMenu(false);
        clearToast();
        menu.remove();
        style.remove();
        for (const [formula, snapshot] of snapshots) {
          actionButtons.get(formula)?.remove();
          formula.removeAttribute("data-dsh-math-formula");
          formula.removeAttribute("data-dsh-math-active");
          restoreAttribute(formula, "role", snapshot.role);
          restoreAttribute(formula, "tabindex", snapshot.tabIndex);
          restoreAttribute(formula, "title", snapshot.title);
          restoreAttribute(formula, "aria-label", snapshot.ariaLabel);
          restoreAttribute(formula, "aria-keyshortcuts", snapshot.ariaKeyShortcuts);
        }
        snapshots.clear();
        actionButtons.clear();
      };
      return { dispose, scan };
    }
    function restoreAttribute(element, name, value) {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }
    
    // src/client/index.ts
    var inject = [];
    function apply(ctx) {
      ctx.effect(() => {
        const controller = installMathInteractions();
        return () => controller.dispose();
      }, "math-copy: formula interactions");
    }
    
    return module.exports;
  }
});
