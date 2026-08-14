interface ClientContext {
    effect(callback: () => void | (() => void), label?: string): unknown;
}
/** No Cordis services are required; the plugin enhances settled KaTeX DOM. */
export declare const inject: string[];
/** Browser half of math-copy. */
export declare function apply(ctx: ClientContext): void;
export { extractLatex, formatLatex, normalizeLatex } from './latex.js';
export type { LatexCopyFormat } from './latex.js';
export { installMathInteractions, writeClipboard } from './dom.js';
export type { MathInteractionController } from './dom.js';
