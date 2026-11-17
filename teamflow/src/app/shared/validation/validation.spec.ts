import { isValidDate, textInRange } from './validation';

describe('shared validation', () => {
  it('checks trimmed text at the exact limits', () => {
    expect(textInRange('  ab  ', 2, 3)).toBe(true);
    expect(textInRange('abc', 2, 3)).toBe(true);
    expect(textInRange(' a ', 2, 3)).toBe(false);
    expect(textInRange('abcd', 2, 3)).toBe(false);
    expect(textInRange('   ', 1, 3)).toBe(false);
  });

  it('accepts real dates in both existing formats', () => {
    expect(isValidDate('2024-02-29')).toBe(true);
    expect(isValidDate('2026.12.04.')).toBe(true);
    expect(isValidDate('2025-02-29')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});
