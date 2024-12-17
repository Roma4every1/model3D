import { MapStage } from '../lib/map-stage';
import { pixelPerMeter } from '../lib/constants';


export class ElementRotateModeProvider implements MapModeProvider {
  public readonly id = 'element-rotate';
  public readonly cursor = 'default';
  public readonly blocked = true;
  private ignoreMove: boolean = true;

  public onMouseDown(): void {
    this.ignoreMove = false;
  }

  public onMouseUp(_: MouseEvent, stage: MapStage): void {
    if (this.ignoreMove) return;
    stage.updateActiveElement(false);
    this.ignoreMove = true;
  }

  public onMouseLeave(_: MouseEvent, stage: MapStage): void {
    if (this.ignoreMove) return;
    stage.updateActiveElement(false);
    this.ignoreMove = true;
  }

  /**
   * Поворачивает подпись на 4 градуса по или против часовой стрелки.
   * С зажатым шифтом выравнивает угол.
   */
  public onWheel(e: WheelEvent, stage: MapStage): void {
    const label = stage.getActiveElement() as MapLabel;
    applyRotateToLabel(label, e.deltaY > 0, e.shiftKey);
    stage.render();
  }

  public onMouseMove(e: MouseEvent, stage: MapStage): void {
    if (this.ignoreMove) return;
    const label = stage.getActiveElement() as MapLabel;

    let { x, y } = stage.eventToPoint(e);
    const k = 0.001 * window.devicePixelRatio * pixelPerMeter;

    x -= label.x + label.xoffset * k;
    y -= label.y - label.yoffset * k;
    x /= Math.sqrt(x * x + y * y);

    label.angle = Math.round(Math.sign(-y) * Math.acos(x) * 180 / Math.PI);
    stage.render();
  }
}

function applyRotateToLabel(label: MapLabel, clockwise: boolean, align: boolean): void {
  if (align) {
    let angle = 0;
    for (let i = -22.5; i < 360; i += 45) {
      if (label.angle === i + 22.5) {
        label.angle += clockwise ? 45 : -45;
        return;
      }
      if (label.angle > i && label.angle < i + 45) {
        label.angle = angle;
        return;
      }
      angle += 45;
    }
  } else {
    label.angle += clockwise ? 4 : -4;
  }

  if (label.angle > 360) label.angle -= 360;
  if (label.angle < 0) label.angle += 360;
}
