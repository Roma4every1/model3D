import { pixelPerMeter } from '../lib/constants';


export class ImageDrawer implements MapElementDrawer<MapImage> {
  public draw(image: Readonly<MapImage>, options: MapDrawOptions): void {
    const { x, y } = options.toCanvasPoint(image);
    const k = image.scale * window.devicePixelRatio * pixelPerMeter / options.scale;

    const width = image.img.width * k;
    const height = image.img.height * k;
    options.ctx.drawImage(image.img, x, y - height, width, height);
  }
}
