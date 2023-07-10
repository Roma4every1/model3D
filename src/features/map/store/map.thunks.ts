import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { fetchFormsStart, fetchFormsEnd } from 'entities/fetch-state';
import { loadMapError, loadMapSuccess, startMapLoad } from './map.actions';
import { mapsAPI } from '../lib/maps.api';


export function fetchMapData(formID: FormID, mapID: MapID, owner: MapOwner, setProgress: Function): Thunk {
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

export function fetchMultiMapData(id: FormID): Thunk {
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
