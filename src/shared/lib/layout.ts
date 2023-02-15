const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.font = `normal 12px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Segoe UI Symbol"`;

/** Ширина текста в пикселях. */
export function measureText(text: string): number {
  return Math.ceil(ctx.measureText(text).width);
}

/** Количество строк, требуемых для отрисовки текста. */
export function getTextLinesCount(text: string, maxWidth: number): number {
  const wordsWidth = text.split(' ').map(measureText);
  let lines = 1, sum = 0;
  for (const width of wordsWidth) {
    if (sum + width < maxWidth) { sum += width; continue; }
    lines += 1; sum = width;
  }
  return lines;
}
