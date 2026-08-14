export type LatexCopyFormat = 'single-dollar' | 'double-dollar' | 'brackets';

/** Normalize KaTeX's source annotation without changing meaningful inner whitespace. */
export function normalizeLatex(source: string): string {
  return source.replace(/\r\n?/g, '\n').trim();
}

/** Wrap raw TeX in the delimiter style selected by the user. */
export function formatLatex(source: string, format: LatexCopyFormat): string {
  const latex = normalizeLatex(source);

  switch (format) {
    case 'single-dollar':
      return `$${latex}$`;
    case 'double-dollar':
      return `$$${latex}$$`;
    case 'brackets':
      return `\\[${latex}\\]`;
  }
}

/** Read the original TeX that KaTeX preserves in its MathML annotation. */
export function extractLatex(formula: Element): string | null {
  const annotation = formula.querySelector('annotation[encoding="application/x-tex"]')
    ?? formula.querySelector('.katex-mathml annotation');
  const source = annotation?.textContent
    ?? (formula.classList.contains('katex-error') ? formula.textContent : null);

  if (source === null) return null;
  const normalized = normalizeLatex(source);
  return normalized.length > 0 ? normalized : null;
}
