export function textInRange(value: string, minimum: number, maximum: number): boolean {
  const length = value.trim().length;
  return length >= minimum && length <= maximum;
}

export function isValidDate(value: string): boolean {
  const match = /^(\d{4})[.-](\d{2})[.-](\d{2})\.?$/.exec(value.trim());
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
