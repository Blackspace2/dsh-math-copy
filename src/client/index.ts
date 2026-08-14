import { installMathInteractions } from './dom.js';

interface ClientContext {
  effect(callback: () => void | (() => void), label?: string): unknown;
}

/** No Cordis services are required; the plugin enhances settled KaTeX DOM. */
export const inject: string[] = [];

/** Browser half of math-copy. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const controller = installMathInteractions();
    return () => controller.dispose();
  }, 'math-copy: formula interactions');
}

export { extractLatex, formatLatex, normalizeLatex } from './latex.js';
export type { LatexCopyFormat } from './latex.js';
export { installMathInteractions, writeClipboard } from './dom.js';
export type { MathInteractionController } from './dom.js';
