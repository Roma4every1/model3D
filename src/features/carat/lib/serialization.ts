import type { XRawElement } from 'shared/lib';
import type { CaratState } from '../store/carat.store';
import type { CaratFormSettings, CaratGlobalSettingsDTO } from './dto.types';
import { CaratDrawer } from '../rendering/drawer';


export function caratStateToSettings(id: FormID, state: CaratState): CaratFormSettings {
  const stage = state.stage;
  const track = stage.getActiveTrack();

  const columns = track.getGroups().map(g => g.getInit());
  columns.push(track.getBackgroundGroup().getInit());
  columns.push(stage.correlations.getInit());

  const settings: CaratGlobalSettingsDTO = {
    scale: Math.round(CaratDrawer.pixelPerMeter / track.viewport.scale),
    strataChannelName: stage.settings.strataChannelName, zones: stage.getZones(),
  };
  return {id, settings, columns};
}

export function caratStateToExtra(state: CaratState): XRawElement {
  const globalSettings = state.stage.settings;
  const hideEmpty = String(globalSettings.hideEmpty);

  const enabled = String(globalSettings.autoWidth);
  const minZoneWidth = globalSettings.minZoneWidth.toString();
  const maxZoneWidth = globalSettings.maxZoneWidth.toString();

  const autoWidth = {name: 'autoWidth', attrs: {enabled, minZoneWidth, maxZoneWidth}};
  return {name: 'extra', attrs: {hideEmpty}, children: [autoWidth]};
}
