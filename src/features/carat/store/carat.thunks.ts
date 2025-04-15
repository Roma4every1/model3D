import { compareArrays } from 'shared/lib';
import { useObjectsStore } from 'entities/objects';
import { useChannelStore, cellsToRecords } from 'entities/channel';
import { useCaratStore } from './carat.store';
import { CaratColumnGroup } from '../rendering/column-group';


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

  const emptyStatus: CaratLoading = {percentage: 100, status: 'base.no-data'};
  const { well: { model: well }, trace: { model: trace } } = useObjectsStore.getState();

  const oldWells = stage.wellIDs;
  if (data.size > 1) {
    if (!trace) return loader.onProgressChange(emptyStatus);
    stage.setTrackList(trace.nodes);
  } else if (data.size === 1 && data.keys().next().value === well?.id) {
    stage.setTrackList(well);
  } else {
    return loader.onProgressChange(emptyStatus);
  }
  const newWells = stage.wellIDs;

  stage.setData(data, loader.cache);
  loader.checkCacheSize();
  loader.onProgressChange({percentage: 100, status: ''});

  if (stage.settings.autoWidth && !compareArrays(oldWells, newWells)) {
    setTimeout(() => {
      stage.adjustWidth();
      stage.render();
    }, 0);
  } else {
    stage.render();
  }
}

/** Дозагрузить каротажные кривые. */
export async function loadCaratCurves(id: FormID, group: CaratColumnGroup): Promise<void> {
  const { stage, loader } = useCaratStore.getState()[id];
  const track = stage.getActiveTrack();
  const curveManager = group.getCurveColumn().curveManager;

  const visibleCurves = curveManager.getVisibleCurves();
  group.groupCurves(visibleCurves);
  const loadedIDs = await loader.loadCurveData(visibleCurves.map(curve => curve.id), false);
  curveManager.setCurvePointData(loadedIDs, loader.cache);
  if (track.constructionMode) track.transformer.transformCurves(visibleCurves);

  loader.checkCacheSize();
  track.updateGroupRects();
  stage.updateTrackRects();

  if (stage.settings.autoWidth) {
    stage.adjustWidth();
  } else {
    stage.resize();
  }
  stage.render();
}
