const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.font = 'normal 12px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Segoe UI Symbol"';

/** Ширина текста в пикселях. */
export function measureText(text: string): number {
  return Math.ceil(ctx.measureText(text).width);
}
