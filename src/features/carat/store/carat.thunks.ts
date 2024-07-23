import { useCaratStore } from './carat.store';
import { useObjectsStore } from 'entities/objects';
import { cellsToRecords, useChannelStore } from 'entities/channel';


/** Обновляет данные каротажной диаграммы. */
export async function setCaratData(id: FormID): Promise<void> {
  const objects = useObjectsStore.getState();
  const channels = useChannelStore.getState().storage;

  const { stage, loader, lookups } = useCaratStore.getState()[id];
  const { well: { model: currentWell }, trace: { model: currentTrace } } = objects;

  if (currentTrace) {
    if (currentTrace.nodes.length) {
      stage.setTrackList(currentTrace.nodes);
    } else {
      return;
    }
  } else if (currentWell) {
    stage.setTrackList([currentWell]);
  } else {
    return;
  }

  if (!stage.actualLookup) {
    const dict: ChannelRecordDict = {};
    for (const id of lookups) dict[id] = cellsToRecords(channels[id]?.data);
    stage.setLookupData(dict);
  }

  const caratData = await loader.loadCaratData(stage.wellIDs, channels);
  if (!caratData) return;

  stage.setData(caratData, loader.cache);
  loader.checkCacheSize();
  loader.onProgressChange({percentage: 100});
  stage.render();
}
