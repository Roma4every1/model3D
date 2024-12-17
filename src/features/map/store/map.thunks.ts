import { t } from 'shared/locales';
import { showNotification } from 'entities/notification';
import { rowToParameterValue, updateParamDeep } from 'entities/parameter';
import { mapAPI } from '../loader/map.api';
import { useMapStore } from './map.store';
import { setMapStatus } from './map.actions';
import { setMapEditState } from './map-edit.actions';


export async function updateMap(id: FormID, mapChannel: Channel): Promise<void> {
  const state = useMapStore.getState()[id];
  const { stage, loader } = state;

  const channelData = mapChannel?.data;
  const row = channelData?.rows?.at(0);

  if (!row) {
    state.mapID = null; state.owner = null;
    if (stage.hasExtraObject('incl')) {
      stage.setData({layers: [], points: [], x: 0, y: 0, scale: 1} as MapData);
      setMapStatus(id, 'ok');
    } else {
      setMapStatus(id, 'empty');
    }
    return;
  }

  const mapID = String(row[channelData.columns.findIndex(c => c.name === 'ID')]);
  const storageID = row[channelData.columns.findIndex(c => c.name === 'OWNER')];

  if (mapID === state.mapID && storageID === state.owner) return;
  state.mapID = mapID;
  state.owner = storageID;

  const activeRowParameter = mapChannel.config.activeRowParameter;
  if (activeRowParameter) {
    const value = rowToParameterValue(row, mapChannel);
    updateParamDeep(activeRowParameter, value).then();
  }
  setMapStatus(id, 'loading');
  const mapData = await loader.loadMapData(mapID, storageID);

  if (typeof mapData === 'string') {
    setMapStatus(id, 'error');
  } else if (mapData) {
    stage.setData(mapData);
    setMapStatus(id, 'ok');
  }
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
  setMapEditState(id, {modified: !res.ok});
}
