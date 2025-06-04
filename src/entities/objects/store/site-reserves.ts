import type { WindowProps } from '@progress/kendo-react-dialogs';
import { createElement } from 'react';
import { t } from 'shared/locales';
import { isPolygonInnerPoint } from 'shared/lib';
import { useClientStore } from 'entities/client';
import { showWindow, closeWindow, showWarningMessage } from 'entities/window';
import { useMapStore } from 'features/map/store/map.store';
import { getPointBounds } from 'features/map/lib/bounds';
import { getInterpolatedFieldValue } from 'features/map/lib/selecting-utils';
import { useObjectsStore } from './objects.store';
import { SiteReservesWindow } from '../components/site-ribbon/site-reserves-window';


/** Рассчитывает запасы по полю и участку и показывает диалог с результатами. */
export function calcSiteReserves(): void {
  const clientStates = useClientStore.getState();
  const { children, activeChildID } = clientStates[clientStates.root.activeChildID];

  const maps = children.filter(c => c.type === 'map');
  const mapClient = maps.find(c => c.id === activeChildID) ?? maps[0];
  const mapState = useMapStore.getState()[mapClient.id];

  const mapData = mapState.stage.getMapData();
  const mapStatus = mapState.status;
  if (!mapData || mapStatus !== 'ok') return showWarningMessage(t('site.error-no-map-data'));

  const layer = mapData.layers.find(l => l.elementType === 'field' && l.visible);
  if (!layer) return showWarningMessage(t('site.error-no-fields'));

  const fields = layer.elements as MapField[];
  const site = useObjectsStore.getState().site.state.model;
  const reserves = calcReserves(fields, site.points);

  const windowProps: WindowProps = {
    className: 'site-reserves-window', title: t('site.reserves-window-title'),
    width: 285, height: 165, resizable: false,
    minimizeButton: () => null, maximizeButton: () => null,
    onClose: () => closeWindow('site-reserves'),
  };
  const context = {site, layer, value: reserves};
  const window = createElement(SiteReservesWindow, {context, close: windowProps.onClose});
  showWindow('site-reserves', windowProps, window);
}

/** Функция рассчёта запасов по полю и участку. */
function calcReserves(fields: MapField[], polygon: Point[]): number {
  let result = 0;
  const { min, max } = getPointBounds(polygon);

  for (const field of fields) {
    const kx = 1 / field.stepx;
    const ky = 1 / field.stepy;
    const area = field.stepx * field.stepy;

    const xMin = Math.round((min.x - field.x) * kx);
    const xMax = Math.round((max.x - field.x) * kx);
    const yMin = Math.round((Math.abs(field.y - max.y)) * ky);
    const yMax = Math.round((Math.abs(field.y - min.y)) * ky);

    for (let x = xMin; x <= xMax; ++x) {
      for (let y = yMin; y <= yMax; ++y) {
        const point = {x: x / kx + field.x, y: field.y - y / ky};
        if (!isPolygonInnerPoint(point, polygon)) continue;
        const value = getInterpolatedFieldValue(field, point);
        if (value !== null) result += value * area;
      }
    }
  }
  return result;
}
