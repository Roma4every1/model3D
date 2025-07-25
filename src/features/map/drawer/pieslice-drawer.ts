export class PieSliceDrawer implements MapElementDrawer<MapPieSlice> {
  public draw(pie: Readonly<MapPieSlice>, options: MapDrawOptions): void {
    const minRadius = 2;
    const maxRadius = 16;
    const k = 0.001 * options.dotsPerMeter;

    let radius = pie.radius;
    if (radius < minRadius) radius = minRadius;
    if (radius > maxRadius) radius = maxRadius;

    const { x, y } = options.toCanvasPoint(pie);
    const r = radius * k;

    const ctx = options.ctx;
    ctx.beginPath();
    if (Math.abs(pie.endangle - pie.startangle - 2 * Math.PI) > 1e-6) ctx.moveTo(x, y);
    ctx.arc(x, y, r, pie.startangle + Math.PI / 2, pie.endangle + Math.PI / 2, false);
    ctx.closePath();

    if (pie.fillname) {
      ctx.fillStyle = pie.fillStyle;
      ctx.fill();
    } else if (!pie.transparent) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(1, pie.color);
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.lineJoin = 'round';

    if (pie.selected) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = k;
      ctx.stroke();
      ctx.strokeStyle = pie.bordercolor;
      ctx.lineWidth = 0.7 * k;
      ctx.stroke();
    } else {
      ctx.strokeStyle = pie.bordercolor;
      ctx.lineWidth = 0.25 * k;
      ctx.stroke();
    }
    ctx.lineJoin = 'miter';
  }
}
