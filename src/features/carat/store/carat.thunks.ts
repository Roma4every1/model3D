import { useObjectsStore } from 'entities/objects';
import { useChannelStore, cellsToRecords } from 'entities/channel';
import { useCaratStore } from './carat.store';


/** Обновляет данные каротажной диаграммы. */
export async function setCaratData(id: FormID): Promise<void> {
  const channels = useChannelStore.getState().storage;
  const { stage, loader, lookups } = useCaratStore.getState()[id];

  if (!stage.actualLookup) {
    const dict: ChannelRecordDict = {};
    for (const id of lookups) dict[id] = cellsToRecords(channels[id]?.data);
    stage.setLookupData(dict);
  }

  const data = await loader.loadCaratData(channels);
  if (!data) return;

  const emptyStatus: CaratLoading = {percentage: 100, status: 'carat.empty'};
  const { well: { model: well }, trace: { model: trace } } = useObjectsStore.getState();

  if (data.size > 1) {
    if (!trace) return loader.onProgressChange(emptyStatus);
    stage.setTrackList(trace.nodes);
  } else if (data.size === 1 && data.keys().next().value === well?.id) {
    stage.setTrackList(well);
  } else {
    return loader.onProgressChange(emptyStatus);
  }

  stage.setData(data, loader.cache);
  loader.checkCacheSize();
  loader.onProgressChange({percentage: 100, status: ''});
  stage.render();
}
