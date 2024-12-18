import { useObjectsStore, setSiteState } from 'entities/objects';
import { MapStage } from '../lib/map-stage';


export class SiteAppendPointModeProvider implements MapModeProvider {
  public readonly id = 'site-append-point';
  public readonly cursor = 'default';
  public readonly blocked = false;

  public onClick(e: MouseEvent, stage: MapStage): void {
    const site = useObjectsStore.getState().site.state.model;
    site.points.push(stage.eventToPoint(e));
    setSiteState({model: {...site}});
  }
}
