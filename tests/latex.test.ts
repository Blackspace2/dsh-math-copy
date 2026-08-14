import { describe, expect, it } from 'vitest';
import { extractLatex, formatLatex, normalizeLatex } from '../src/client/latex.js';

describe('LaTeX formatting', () => {
  it('normalizes only outer whitespace and line endings', () => {
    expect(normalizeLatex('  a + b\r\n= c  ')).toBe('a + b\n= c');
  });

  it.each([
    ['single-dollar', '$x^2$'],
    ['double-dollar', '$$x^2$$'],
    ['brackets', '\\[x^2\\]'],
  ] as const)('wraps with %s delimiters', (format, expected) => {
    expect(formatLatex(' x^2 ', format)).toBe(expected);
  });

  it('extracts source from the KaTeX annotation', () => {
    const formula = document.createElement('span');
    formula.className = 'katex';
    formula.innerHTML = '<span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">\\frac{a}{b}</annotation></semantics></math></span>';
    expect(extractLatex(formula)).toBe('\\frac{a}{b}');
  });

  it('falls back to malformed KaTeX text', () => {
    const formula = document.createElement('span');
    formula.className = 'katex-error';
    formula.textContent = ' \\badcommand ';
    expect(extractLatex(formula)).toBe('\\badcommand');
  });
});
