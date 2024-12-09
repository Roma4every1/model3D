export class SignDrawer implements MapElementDrawer<MapSign> {
  public bound(sign: MapSign): Bounds {
    return {min: sign, max: sign};
  }

  public draw(sign: Readonly<MapSign>, options: MapDrawOptions): void {
    const img = sign.img;
    if (!img) return;

    const point = options.toCanvasPoint(sign);
    let width = img.width * sign.size * window.devicePixelRatio;
    let height = img.height * sign.size * window.devicePixelRatio;

    if (sign.selected) {
      width *= 2;
      height *= 2;
    }
    options.ctx.drawImage(img, point.x - width / 2, point.y - height / 2, width, height);
  }
}
