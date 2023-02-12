import { Dispatch } from 'redux';
import { loadMapError, loadMapSuccess, startMapLoad } from './maps.actions';
import { mapsAPI } from '../lib/maps.api';


export const fetchMapData = (formID: FormID, mapID: MapID, owner: MapOwner, setProgress: Function) => {
  return async (dispatch: Dispatch) => {
    dispatch(startMapLoad(formID));
    const mapData = await mapsAPI.loadMap(mapID, owner, setProgress);
    if (typeof mapData === 'string') {
      console.warn(mapData);
      dispatch(loadMapError(formID));
    } else {
      if (mapData.mapErrors.length) mapData.mapErrors.forEach(err => console.warn(err));
      dispatch(loadMapSuccess(formID, mapData));
    }
  }
};
