import { setSelectionState, createSelectionItem } from 'entities/objects';
import { MapStage } from '../lib/map-stage';
import { checkDistancePoints } from '../lib/selecting-utils';


export class SelectionEditModeProvider implements MapModeProvider {
  public readonly id = 'selection-edit';
  public readonly cursor = 'default';
  public readonly blocked = false;

  /** Добавление/удаление точек к текущей выборке через клик по карте. */
  public onClick(e: MouseEvent, stage: MapStage): void {
    const clickPoint = stage.eventToPoint(e);
    const { points, scale } = stage.getMapData();

    const mapPoint = points.find(p => checkDistancePoints(clickPoint, p, scale));
    if (!mapPoint) return;

    const model: SelectionModel = stage.getExtraObject('selection');
    const id = mapPoint.UWID;

    if (model.items.some(item => item.id === id)) {
      model.items = model.items.filter(item => item.id !== id);
    } else {
      const newItem = createSelectionItem(id);
      if (!newItem) return;
      model.items = [...model.items, newItem];
    }
    setSelectionState({model: {...model}});
  }
}
