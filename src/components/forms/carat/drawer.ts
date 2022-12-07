import { updateCanvasSize } from "../map/drawer/maps";


export function drawCarat(canvas: HTMLCanvasElement, wellID: string): void {
  updateCanvasSize(canvas);
  canvas.getContext('2d').fillText(wellID, 100, 100);
}
