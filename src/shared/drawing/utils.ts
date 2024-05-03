export function parseDashArray(input: string): number[] {
  if (!input) return [];
  return input.split(/ +/).map(Number);
}

/** Перевод текстового представления выравнивания в численное.
 * @example
 * 'left' => -1
 * 'right' => 1
 * 'center' => 0
 */
export function parseHorizontalAlign(input: string): NAlign {
  input = input.toLowerCase();
  if (input === 'left' || input === 'start') return -1;
  if (input === 'right' || input === 'end') return 1;
  return 0;
}
