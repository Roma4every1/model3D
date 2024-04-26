import { useCaratStore } from './carat.store';
import { useChannelStore } from 'entities/channel';
import { useObjectsStore } from 'entities/objects';

import { setCaratLoading } from './carat.actions';
import { channelDictToRecords } from '../lib/channels';


/** Обновляет данные каротажной диаграммы. */
export async function setCaratData(id: FormID, data: ChannelDict): Promise<void> {
  const objects = useObjectsStore.getState();
  const channels = useChannelStore.getState();

  const { stage, loader, lookupNames } = useCaratStore.getState()[id];
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

  loader.onProgressChange = (loading: Partial<CaratLoading>) => {
    if (loading.status) loading.status = 'carat.loading.' + loading.status;
    setCaratLoading(id, loading);
  };

  const flag = ++loader.flag;
  const caratData = await loader.loadCaratData(stage.wellIDs, data);

  if (!stage.actualLookup) {
    const dict: ChannelDict = {};
    lookupNames.forEach((name) => { dict[name] = channels[name]; });
    const lookupData = channelDictToRecords(dict);
    await stage.setLookupData(lookupData);
  }
  if (flag !== loader.flag) return;

  stage.setData(caratData, loader.cache);
  loader.checkCacheSize();
  loader.onProgressChange({percentage: 100});
  stage.render();
}
