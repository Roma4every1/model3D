import type { MapExtraObjectConfig } from './types';
import type { InclInitData } from './incl.object';
import { MapStage } from '../lib/map-stage';
import { MapWellObjectProvider } from './well.object';
import { MapTraceObjectProvider } from './trace.object';
import { MapSiteObjectProvider } from './site.object';
import { MapInclinometryProvider } from './incl.object';


export function createMapWellConfig(stage: MapStage): MapExtraObjectConfig {
  return {
    layer: {displayName: 'Активная скважина', minScale: 0, maxScale: Infinity},
    provider: new MapWellObjectProvider(stage),
  };
}

export function createMapTraceConfig(): MapExtraObjectConfig {
  return {
    layer: {displayName: 'Трасса', minScale: 0, maxScale: Infinity},
    provider: new MapTraceObjectProvider(),
  };
}

export function createMapSiteConfig(stage: MapStage): MapExtraObjectConfig {
  return {
    layer: {displayName: 'Участок', minScale: 0, maxScale: Infinity},
    provider: new MapSiteObjectProvider(stage),
  };
}

export function createMapInclConfig(stage: MapStage, data: InclInitData): MapExtraObjectConfig {
  return {
    layer: {displayName: 'Инклинометрия', minScale: 0, maxScale: Infinity, customizable: false},
    provider: new MapInclinometryProvider(stage, data),
  };
}
