import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { showNotification } from 'entities/notifications';
import { fetchFormsStart, fetchFormsEnd } from 'entities/fetch-state';
import { loadMapError, loadMapSuccess, setMapField, startMapLoad } from './map.actions';
import { t } from 'shared/locales';
import { mapsAPI } from '../lib/maps.api';


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

    for (const config of multiMapState.configs) {
      config.setProgress(0);
      const loadedMap = await mapsAPI.loadMap(config.id, 'Common', config.setProgress, id);
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
