/**
 * @example
 * '' => []
 * '2 4' => [2, 4]
 */
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

/* --- --- */

const canvas = document.createElement('canvas');
const fontCache: Record<string, CanvasRenderingContext2D> = {};

/** Измеряет ширину текста в пикселях. */
export function measureText(text: string, font: string): number {
  let ctx = fontCache[font];
  if (!ctx) {
    ctx = canvas.getContext('2d');
    ctx.font = font;
    fontCache[font] = ctx;
  }
  return Math.ceil(ctx.measureText(text).width);
}

/**
 * Разбивает текст на строки, каждая из которых по ширине
 * не превышает указанный предел.
 *
 * @param text текст, который нужно разбить на строки
 * @param font шрифт для текста
 * @param limit максимально допустимая ширина в пикселях
 */
export function splitByWidth(text: string, font: string, limit: number): string[] {
  const noPos = Number.MAX_SAFE_INTEGER;
  const result = [];

  let currentLineBegin = 0;
  let currentLineEnd = text.indexOf(' ');
  if (currentLineEnd === -1) currentLineEnd = noPos;

  while (currentLineEnd !== noPos) {
    let space = text.indexOf(' ', currentLineEnd + 1);
    if (space === -1) space = noPos;
    let line = text.substring(currentLineBegin, space);

    if (measureText(line, font) > limit) {
      result.push(text.substring(currentLineBegin, currentLineEnd));
      currentLineBegin = currentLineEnd + 1;
    }
    currentLineEnd = space;
  }
  result.push(text.substring(currentLineBegin, currentLineEnd));
  return result;
}
