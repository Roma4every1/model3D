import { createElement } from 'react';
import { showNotification } from 'entities/notification';
import { clientFetchingStart, clientFetchingEnd } from 'entities/fetch-state';
import { setMapField, setMapLoading, } from './map.actions';
import { closeWindow, showWindow } from 'entities/window';

import { t } from 'shared/locales';
import { mapAPI } from '../lib/map.api';
import { propertyWindowConfig } from '../lib/constants';
import { WindowProps } from '@progress/kendo-react-dialogs';
import { AttrTableWindow } from '../components/edit-panel/editing/attr-table';
import { PropertiesWindow } from '../components/edit-panel/properties-window/properties';
import { useMapStore, useMultiMapStore } from './map.store';


/** Показать окно свойств активного элемента. */
export function showMapPropertyWindow(id: FormID, element: MapElement): void {
  const windowID = 'map-properties-window';
  const stage = useMapStore.getState()[id].stage;

  const close = () => {
    setMapField(id, 'propertyWindowOpen', false);
    closeWindow(windowID);
  };
  const cancel = () => {
    stage.cancel(); stage.render();
    close();
  };
  stage.startEditing();

  const [width, height] = propertyWindowConfig[element.type].windowSize;
  const title = t('map.properties-edit', {elementType: t('map.' + element.type)});

  const windowProps: WindowProps = {
    className: 'propertiesWindow', style: {zIndex: 99}, title,
    width, height, resizable: false, maximizeButton: () => null, onClose: cancel,
  };

  const props = {id, stage, element, cancel, close};
  setMapField(id, 'propertyWindowOpen', true);
  showWindow(windowID, windowProps, createElement(PropertiesWindow, props));
}

/** Показать аттрибутивную таблицу активного элемента. */
export function showMapAttrTableWindow(id: FormID): void {
  const windowID = 'map-attr-table';
  const stage = useMapStore.getState()[id].stage;

  const onClose = () => {
    setMapField(id, 'attrTableWindowOpen', false);
    closeWindow(windowID);
  };
  const windowProps: WindowProps = {
    className: 'attr-table-window', title: t('map.attr-table'),
    width: 320, height: 260, onClose, maximizeButton: () => null,
  };

  const content = createElement(AttrTableWindow, {id, stage, onClose});
  setMapField(id, 'attrTableWindowOpen', true);
  showWindow(windowID, windowProps, content);
}

export async function fetchMapData(id: FormID): Promise<void> {
  const { stage, loader, mapID, owner } = useMapStore.getState()[id];
  setMapLoading(id, {percentage: 0, status: null});

  loader.onProgressChange = (l: MapLoading) => setMapLoading(id, l);
  const mapData = await loader.loadMapData(mapID, owner);

  if (typeof mapData === 'string') {
    console.warn(mapData);
    setMapLoading(id, {percentage: -1, status: null});
  } else if (mapData) {
    stage.setData(mapData);
    setMapLoading(id, {percentage: 100, status: null});
  }
}

export async function fetchMultiMapData(id: ClientID): Promise<void> {
  const multiMapState = useMultiMapStore.getState()[id];
  if (!multiMapState) return;
  clientFetchingStart(id + '_map');

  const updateStages = () => {
    for (const config of multiMapState.configs) {
      config.stage.scroller.list = multiMapState.configs
        .filter(c => c.id !== config.id)
        .map(c => c.stage.getCanvas())
        .filter(Boolean);
    }
  };

  for (const config of multiMapState.configs) {
    const loader = config.loader;
    loader.onProgressChange = (l: MapLoading) => config.setProgress(l.percentage);
    const mapData = await loader.loadMapData(config.id, 'Common');

    if (typeof mapData === 'string') {
      config.setProgress(-1);
    } else if (mapData) {
      config.setProgress(100);
      config.stage.setData(mapData);
      updateStages();
    }
  }
  clientFetchingEnd(id + '_map');
  setTimeout(updateStages, 100);
}

/** Сохранение отредактированной карты. */
export async function saveMap(id: FormID): Promise<void> {
  const { stage, owner, mapID } = useMapStore.getState()[id];
  showNotification(t('map.saving.save-start'));

  const mapData = stage.getMapDataToSave();
  const res = await mapAPI.saveMap(id, mapID, mapData, owner);

  const notice: NotificationProto = res.ok
    ? {type: 'info', content: t('map.saving.save-end-ok')}
    : {type: 'warning', content: t('map.saving.save-end-error')};

  showNotification(notice);
  setMapField(id, 'modified', !res.ok);
}
