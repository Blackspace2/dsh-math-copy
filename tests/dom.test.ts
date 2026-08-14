import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installMathInteractions, writeClipboard, type MathInteractionController } from '../src/client/dom.js';

function formula(display = false): HTMLElement {
  const katex = document.createElement('span');
  katex.className = 'katex';
  katex.innerHTML = '<span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">x^2 + y^2</annotation></semantics></math></span><span class="katex-html">rendered</span>';
  if (!display) return katex;
  const wrapper = document.createElement('span');
  wrapper.className = 'katex-display';
  wrapper.append(katex);
  return wrapper;
}

describe('math DOM interactions', () => {
  let controller: MathInteractionController;
  const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    writeText.mockClear();
  });

  afterEach(() => {
    controller?.dispose();
    vi.restoreAllMocks();
  });

  it('enhances inline and display formulas but not the nested display span', () => {
    const inline = formula();
    const display = formula(true);
    document.body.append(inline, display);
    controller = installMathInteractions();

    expect(inline.hasAttribute('data-dsh-math-formula')).toBe(true);
    expect(display.hasAttribute('data-dsh-math-formula')).toBe(true);
    expect(display.querySelector('.katex')?.hasAttribute('data-dsh-math-formula')).toBe(false);
    expect(inline.getAttribute('role')).toBeNull();
    expect(inline.getAttribute('tabindex')).toBeNull();
    const action = inline.querySelector<HTMLButtonElement>('[data-dsh-math-action]');
    expect(action?.getAttribute('aria-haspopup')).toBe('menu');
    expect(inline.querySelector('.katex-mathml')).not.toBeNull();
  });

  it('copies double-dollar LaTeX on primary click and shows feedback', async () => {
    const inline = formula();
    document.body.append(inline);
    controller = installMathInteractions();
    inline.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('$$x^2 + y^2$$');
      expect(document.querySelector('.dsh-math-copied-toast')?.textContent).toBe('Copied ✓');
    });
  });

  it('opens the context menu and copies the chosen delimiter', async () => {
    const inline = formula();
    document.body.append(inline);
    controller = installMathInteractions();
    inline.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 24, clientY: 32 }));

    const menu = document.querySelector<HTMLElement>('.dsh-math-copy-menu');
    expect(menu?.hidden).toBe(false);
    const labels = Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
      .map((item) => item.textContent?.trim());
    expect(labels).toEqual(['$...$', '$$...$$', String.raw`\[...\]`]);
    expect(menu?.querySelector('.dsh-math-copy-menu__title')).toBeNull();
    menu?.querySelector<HTMLElement>('[data-format="brackets"]')?.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('\\[x^2 + y^2\\]'));
    expect(menu?.hidden).toBe(true);
  });

  it('falls back to execCommand when Clipboard API rejects', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });

    await expect(writeClipboard('$$z$$')).resolves.toBeUndefined();
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('enhances formulas added after activation', async () => {
    controller = installMathInteractions();
    const late = formula();
    document.body.append(late);
    await vi.waitFor(() => expect(late.hasAttribute('data-dsh-math-formula')).toBe(true));
  });

  it('restores owned attributes and removes plugin surfaces on dispose', () => {
    const inline = formula();
    inline.setAttribute('title', 'original');
    inline.setAttribute('aria-label', 'original formula');
    document.body.append(inline);
    controller = installMathInteractions();
    controller.dispose();

    expect(inline.hasAttribute('data-dsh-math-formula')).toBe(false);
    expect(inline.getAttribute('title')).toBe('original');
    expect(inline.getAttribute('aria-label')).toBe('original formula');
    expect(document.querySelector('.dsh-math-copy-menu')).toBeNull();
    expect(document.querySelector('style[data-plugin-css="dsh-math-copy/styles"]')).toBeNull();
  });
});
