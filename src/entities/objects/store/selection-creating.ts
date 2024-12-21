import { t } from 'shared/locales';
import { isPolygonInnerPoint } from 'shared/lib';
import { showWarningMessage } from 'entities/window';
import { useClientStore } from 'entities/client';
import { useChannelStore } from 'entities/channel';
import { useMapStore } from 'features/map/store/map.store';
import { useObjectsStore } from './objects.store';
import { createSelection } from './selection.thunks';
import { setSelectionState, openSelectionEditor } from './selection.actions';


/** Функция для создания выборки по участку. */
export async function createSelectionFromSite(): Promise<void> {
  const clientStates = useClientStore.getState();
  const { children, activeChildID } = clientStates[clientStates.root.activeChildID];
  const maps = children.filter(c => c.type === 'map');
  const mapClient = maps.find(c => c.id === activeChildID) ?? maps[0];

  const mapData = useMapStore.getState()[mapClient.id].stage.getMapData();
  if (!mapData) return showWarningMessage(t('selection.error-no-map-data'));
  const lookupData = getItemCreateData();
  if (!lookupData) return showWarningMessage(t('selection.error-no-lookup-data'));

  await createSelection();
  const objects = useObjectsStore.getState();
  const model = objects.selection.state.model;
  const sitePoints = objects.site.state.model.points;

  const ids: WellID[] = [];
  const items: SelectionItem[] = [];

  for (const point of mapData.points) {
    if (isPolygonInnerPoint(point, sitePoints)) ids.push(point.UWID);
  }
  if (ids.length) {
    const { rows, idIndex, nameIndex, placeIndex } = lookupData;
    for (const id of ids) {
      const row = rows.find(r => r[idIndex] === id);
      if (row) items.push({id, name: row[nameIndex], place: row[placeIndex]});
    }
  }
  setSelectionState({model: {...model, items}, initModel: null, editing: true});
  openSelectionEditor();
}

export function createSelectionItem(id: WellID): SelectionItem {
  const createData = getItemCreateData();
  if (!createData) return;
  const { rows, idIndex, nameIndex, placeIndex } = createData;

  const row = rows.find(r => r[idIndex] === id);
  if (row) return {id, name: row[nameIndex], place: row[placeIndex]};
}

function getItemCreateData() {
  const manager = useObjectsStore.getState().selection;
  const lookup = manager.info.items.details.info.id.lookups.name;

  const channel = useChannelStore.getState().storage[lookup.id];
  if (!channel.data) return;

  const columns = channel.data.columns;
  const findIndex = (name: ColumnName) => columns.findIndex(c => c.name === name);

  const idIndex = findIndex(lookup.info.id.columnName);
  const nameIndex = findIndex(lookup.info.name.columnName);
  const placeIndex = findIndex(lookup.info.place.columnName);
  return {rows: channel.data.rows, idIndex, nameIndex, placeIndex};
}
