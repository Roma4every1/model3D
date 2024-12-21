import { useChannelStore } from 'entities/channel';
import { useParameterStore, updateParamDeep, rowToParameterValue } from 'entities/parameter';
import { useObjectsStore } from './objects.store';


/** По данным обновления параметров обновляет активные объекты. */
export function updateObjects(changes: Set<ParameterID>): void {
  let changed = false;
  let { place, stratum, well, trace, selection, site } = useObjectsStore.getState();
  const storage = useParameterStore.getState().storage;

  if (place.activated() && changes.has(place.parameterID)) {
    const value = storage.get(place.parameterID).getValue() as TableRowValue;
    if (place.onParameterUpdate(value)) changed = true;
  }
  if (stratum.activated() && changes.has(stratum.parameterID)) {
    const value = storage.get(stratum.parameterID).getValue() as TableRowValue;
    if (stratum.onParameterUpdate(value)) changed = true;
  }
  if (well.activated() && changes.has(well.parameterID)) {
    const value = storage.get(well.parameterID).getValue() as TableRowValue;
    if (well.onParameterUpdate(value)) changed = true;
  }
  if (trace.activated() && changes.has(trace.parameterID)) {
    const value = storage.get(trace.parameterID).getValue() as TableRowValue;
    const channels = useChannelStore.getState().storage;
    if (trace.onParameterUpdate(value, channels)) { trace = trace.clone(); changed = true; }
  }
  if (selection.activated() && changes.has(selection.parameterID)) {
    const value = storage.get(selection.parameterID).getValue() as TableRowValue;
    const channels = useChannelStore.getState().storage;
    if (selection.onParameterUpdate(value, channels)) { selection.state = {...selection.state}; changed = true; }
  }
  if (site.activated() && changes.has(site.parameterID)) {
    const value = storage.get(site.parameterID).getValue() as TableRowValue;
    const channels = useChannelStore.getState().storage;
    if (site.onParameterUpdate(value, channels)) { site.state = {...site.state}; changed = true; }
  }
  if (changed) {
    useObjectsStore.setState({place, stratum, well, trace, selection, site}, true);
  }
}

/** Обновление параметры скважины. */
export async function setCurrentWell(id: WellID): Promise<void> {
  const { channelID, parameterID, model } = useObjectsStore.getState().well;
  if (model && model.id === id) return;
  const wellChannel = useChannelStore.getState().storage[channelID];

  const idIndex = wellChannel.config.lookupColumns.id.columnIndex;
  const row = wellChannel.data?.rows.find(r => r[idIndex] === id);
  if (!row) return;

  const rowValue = rowToParameterValue(row, wellChannel);
  return updateParamDeep(parameterID, rowValue);
}
