import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { createElement } from 'react';
import { showNotification } from 'entities/notifications';
import { fetchFormsStart, fetchFormsEnd } from 'entities/fetch-state';
import {
  cancelCreatingElement,
  loadMapError,
  loadMapSuccess,
  setEditMode,
  setMapField,
  startMapLoad
} from './map.actions';
import { t } from 'shared/locales';
import { mapsAPI } from '../lib/maps.api';
import { PropertiesWindow } from '../components/edit-panel/properties-window/properties.tsx';
import { MapMode, propertyWindowConfig } from '../lib/constants.ts';
import { WindowProps } from '@progress/kendo-react-dialogs';
import { closeWindow, showWindow } from '../../../entities/window';
import { createMapElementInit } from '../lib/map-utils.ts';


export function showMapPropertyWindow(id: FormID, element: MapElement): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const mapState = getState().maps.single[id];
    if (mapState.mode < MapMode.MOVE_MAP) dispatch(setEditMode(id, MapMode.MOVE_MAP));

    const creating = mapState.isElementCreating;
    const init = createMapElementInit(element);
    mapState.elementInitProperties = init;

    const windowID = 'map-properties-window';
    const close = () => dispatch(closeWindow(windowID));

    const onClose = () => {
      close();
      mapState.elementInitProperties = null;
      if (creating) {
        dispatch(cancelCreatingElement(id));
      } else {
        for (const field in init) element[field] = init[field];
      }
      mapState.utils.updateCanvas();
    };

    const content = createElement<any>(PropertiesWindow, {id, init, cancel: onClose, close});
    const [width, height] = propertyWindowConfig[element.type].windowSize;
    const title = t('map.properties-edit', {elementType: t('map.' + element.type)});

    const windowProps: WindowProps = {
      className: 'propertiesWindow', style: {zIndex: 99}, title,
      width, height, resizable: false, maximizeButton: () => null, onClose,
    };
    dispatch(showWindow(windowID, windowProps, content));
  };
}

export function fetchMapData(formID: FormID, mapID: MapID, owner: MapOwner, setProgress: (p: number) => void): Thunk {
  return async (dispatch: Dispatch) => {
    dispatch(startMapLoad(formID));
    const mapData = await mapsAPI.loadMap(mapID, owner, setProgress, formID);
    if (typeof mapData === 'string') {
      console.warn(mapData);
      dispatch(loadMapError(formID));
    } else {
      if (mapData.mapErrors.length) mapData.mapErrors.forEach(err => console.warn(err));
      dispatch(loadMapSuccess(formID, mapData));
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

    for (const config of multiMapState.configs) {
      config.setProgress(0);
      const loadedMap = await mapsAPI.loadMap(config.id, owner, config.setProgress, templateID);
      config.data = loadedMap;

      const formID = config.formID;
      if (typeof loadedMap === 'string') {
        config.setProgress(-1);
        dispatch(loadMapError(formID));
      } else {
        config.setProgress(100);
        dispatch(loadMapSuccess(formID, loadedMap));
      }
    }
    dispatch(fetchFormsEnd([id + '_map']));
  };
}

/** Сохранение отредактированной карты. */
export function saveMap(id: FormID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { mapData, owner, mapID } = getState().maps.single[id];
    showNotification(t('map.saving.save-start'))(dispatch).then();

    const data = {
      ...mapData,
      x: undefined, y: undefined, scale: undefined, onDrawEnd: undefined,
      layers: mapData.layers.filter(layer => !layer.temporary && layer.elementType !== 'field')
    };
    const res = await mapsAPI.saveMap(id, mapID, data, owner);

    const notice: NotificationProto = res.ok
      ? {type: 'info', content: t('map.saving.save-end-ok')}
      : {type: 'warning', content: t('map.saving.save-end-error')};

    showNotification(notice)(dispatch).then();
    dispatch(setMapField(id, 'isModified', !res.ok));
  };
}
