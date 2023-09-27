import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { createElement } from 'react';

import { showNotification } from 'entities/notifications';
import { fetchFormsStart, fetchFormsEnd } from 'entities/fetch-state';
import { setMapField, setMapLoading, } from './map.actions';
import { closeWindow, showWindow } from '../../../entities/window';

import { t } from 'shared/locales';
import { mapsAPI } from '../lib/maps.api';
import { propertyWindowConfig } from '../lib/constants.ts';
import { WindowProps } from '@progress/kendo-react-dialogs';
import { AttrTableWindow } from '../components/edit-panel/editing/attr-table.tsx';
import { PropertiesWindow } from '../components/edit-panel/properties-window/properties.tsx';


/** Показать окно свойств активного элемента. */
export function showMapPropertyWindow(id: FormID, element: MapElement): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const windowID = 'map-properties-window';
    const stage = getState().maps.single[id].stage;

    const close = () => {
      dispatch(setMapField(id, 'propertyWindowOpen', false));
      dispatch(closeWindow(windowID));
    };
    const cancel = () => {
      stage.listeners.propertyWindowClose = () => {};
      stage.cancel(); stage.render(); close();
    };

    stage.listeners.propertyWindowClose = cancel;
    stage.startEditing();

    const [width, height] = propertyWindowConfig[element.type].windowSize;
    const title = t('map.properties-edit', {elementType: t('map.' + element.type)});

    const windowProps: WindowProps = {
      className: 'propertiesWindow', style: {zIndex: 99}, title,
      width, height, resizable: false, maximizeButton: () => null, onClose: cancel,
    };

    const props = {id, stage, element, cancel, close};
    dispatch(setMapField(id, 'propertyWindowOpen', true));
    dispatch(showWindow(windowID, windowProps, createElement(PropertiesWindow, props)));
  };
}

/** Показать аттрибутивную таблицу активного элемента. */
export function showMapAttrTableWindow(id: FormID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const stage = getState().maps.single[id].stage;

    const onClose = () => {
      stage.listeners.attrTableWindowClose = () => {};
      dispatch(setMapField(id, 'attrTableWindowOpen', false));
      dispatch(closeWindow('map-attr-table'));
    };
    const windowProps: WindowProps = {
      className: 'attr-table-window', title: t('map.attr-table'),
      width: 320, height: 260, onClose, maximizeButton: () => null,
    };

    stage.listeners.attrTableWindowClose = onClose;
    const content = createElement(AttrTableWindow, {id, stage, onClose});

    dispatch(setMapField(id, 'attrTableWindowOpen', true));
    dispatch(showWindow('map-attr-table', windowProps, content));
  };
}

export function fetchMapData(id: FormID): Thunk {
  return async (dispatch: Dispatch, getState) => {
    const { stage, mapID, owner } = getState().maps.single[id];
    const setLoading = (l: MapLoading) => dispatch(setMapLoading(id, l));

    setLoading({percentage: 0, status: null});
    const mapData = await mapsAPI.loadMap(mapID, owner, setLoading, id);

    if (typeof mapData === 'string') {
      console.warn(mapData);
      dispatch(setMapLoading(id, {percentage: -1, status: null}));
    } else {
      if (mapData.mapErrors.length) mapData.mapErrors.forEach(err => console.warn(err));
      stage.setData(mapData);
      dispatch(setMapLoading(id, {percentage: 100, status: null}));
    }
  }
}

export function fetchMultiMapData(id: ClientID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const multiMapState = getState().maps.multi[id];
    if (!multiMapState) return;

    dispatch(fetchFormsStart([id + '_map']));
    const owner = 'Common';
    const templateID = multiMapState.templateFormID;

    const updateStages = () => {
      for (const config of multiMapState.configs) {
        config.stage.scroller.list = multiMapState.configs
          .filter(c => c.id !== config.id)
          .map(c => c.stage.getCanvas())
          .filter(Boolean);
      }
    };

    for (const config of multiMapState.configs) {
      const setProgress = (l: MapLoading) => config.setProgress(l.percentage);
      const loadedMap = await mapsAPI.loadMap(config.id, owner, setProgress, templateID);

      if (typeof loadedMap === 'string') {
        config.setProgress(-1);
      } else {
        config.setProgress(100);
        config.stage.setData(loadedMap);
        updateStages();
      }
    }
    dispatch(fetchFormsEnd([id + '_map']));
    setTimeout(updateStages, 100);
  };
}

/** Сохранение отредактированной карты. */
export function saveMap(id: FormID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { stage, owner, mapID } = getState().maps.single[id];
    showNotification(t('map.saving.save-start'))(dispatch).then();

    const mapData = stage.getMapDataToSave();
    const res = await mapsAPI.saveMap(id, mapID, mapData, owner);

    const notice: NotificationProto = res.ok
      ? {type: 'info', content: t('map.saving.save-end-ok')}
      : {type: 'warning', content: t('map.saving.save-end-error')};

    showNotification(notice)(dispatch).then();
    dispatch(setMapField(id, 'modified', !res.ok));
  };
}
