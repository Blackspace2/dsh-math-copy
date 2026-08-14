export type LatexCopyFormat = 'single-dollar' | 'double-dollar' | 'brackets';
/** Normalize KaTeX's source annotation without changing meaningful inner whitespace. */
export declare function normalizeLatex(source: string): string;
/** Wrap raw TeX in the delimiter style selected by the user. */
export declare function formatLatex(source: string, format: LatexCopyFormat): string;
/** Read the original TeX that KaTeX preserves in its MathML annotation. */
export declare function extractLatex(formula: Element): string | null;
