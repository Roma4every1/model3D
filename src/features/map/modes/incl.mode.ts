import { updateParamDeep } from 'entities/parameter';
import { MapStage } from '../lib/map-stage';


export class InclinometryModeProvider implements MapModeProvider {
  public readonly id = 'incl';
  public readonly cursor = 'default';
  public readonly blocked = true;

  constructor(private readonly parameterID: ParameterID) {}

  public onClick(e: MouseEvent, stage: MapStage): void {
    if (!stage.getExtraObject('incl')) return;
    const canvas = stage.getCanvas();
    const dx = (e.offsetX * window.devicePixelRatio) - (canvas.width / 2);
    const dy = (canvas.height) / 2 - (e.offsetY * window.devicePixelRatio);

    let angleDegrees = Math.atan(dy / dx) * 180 / Math.PI;
    if (dx < 0) angleDegrees += 180;
    angleDegrees = -angleDegrees + 90;

    const angle = angleDegrees < 0 ? angleDegrees + 360 : angleDegrees;
    updateParamDeep(this.parameterID, Math.round(angle)).then();
  }
}
