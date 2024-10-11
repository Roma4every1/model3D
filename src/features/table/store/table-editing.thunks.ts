import { t } from 'shared/locales';
import { createElement } from 'react';
import { showNotification } from 'entities/notification';
import { showWarningMessage, showDialog, closeWindow } from 'entities/window';
import { reloadChannelsByQueryIDs, reloadChannel, channelAPI } from 'entities/channel';
import { useTableStore } from './table.store';
import { ValidationDialog } from '../components/dialogs/validation';


/**
 * Выход таблицы из режима редактирования.
 * Если `save` равен true, изменения применяются, иначе отменяются.
 */
export async function endTableEditing(id: FormID, save: boolean, cell?: TableActiveCell): Promise<void> {
  const state = useTableStore.getState()[id];
  const { data, selection } = state;
  const { records, activeCell } = data;

  if (activeCell.row === null || activeCell.edited !== true) return;
  const record = records[activeCell.row];
  const isNew = data.isNewRecord(record);

  const hasChanges = isNew || record.initCells;
  if (!cell) cell = {...activeCell, edited: false};
  if (hasChanges) cell.edited = false;

  const update = () => {
    useTableStore.setState({[id]: {...state}});
    if (cell.edited === false) state.viewport.focusRoot();
  };

  if (!save) {
    if (isNew) {
      data.setActiveCell(null);
      data.delete(record.index);
      selection.clear();
    } else {
      data.setActiveCell(cell);
      data.rollbackRecord(record);
    }
    return update();
  }
  if (!hasChanges) {
    data.setActiveCell(cell);
    return update();
  }
  const errors = isNew || data.validateRecord(record);

  if (Array.isArray(errors) && errors.length) {
    const windowID = 'record-validation';
    const onClose = () => { closeWindow(windowID); state.viewport.focusRoot(); }

    const dialogProps = {title: t('table.validation.dialog-title'), minWidth: 320, onClose};
    const contentProps = {errors, columns: state.columns.dict, onClose};
    showDialog(windowID, dialogProps, createElement(ValidationDialog, contentProps));
    useTableStore.setState({[id]: {...state}}); return;
  }
  if (isNew) {
    data.setActiveCell(null);
    selection.clear();
  } else {
    data.setActiveCell(cell);
  }
  data.commitRecord(record);

  update();
  showNotification(t('table.save-start'));

  const res = isNew
    ? await channelAPI.insertRows(data.queryID, [record.cells])
    : await channelAPI.updateRows(data.queryID, [record.index], [record.cells]);

  const error = res.ok ? res.data.error : res.message;
  if (error) {
    showWarningMessage(error);
    return reloadChannel(state.channelID);
  }
  await reloadChannelsByQueryIDs([data.queryID, ...res.data.modifiedTables]);
  showNotification(t('table.save-ok'));
  update();
}

/** Удаление строк таблицы. */
export async function deleteTableRecords(id: FormID, indexes: number[]): Promise<void> {
  if (indexes.length === 0) return;
  const state = useTableStore.getState()[id];
  const queryID = state.data.queryID;
  const res = await channelAPI.removeRows(queryID, indexes);

  const error = res.ok ? res.data.error : res.message;
  if (error) {
    showWarningMessage(error);
    return reloadChannel(state.channelID);
  }

  const activeCell = state.data.activeCell;
  if (indexes.includes(activeCell.row)) {
    state.data.setActiveCell({row: null, column: null, edited: false});
  }
  state.selection.clear();

  await reloadChannelsByQueryIDs([queryID, ...res.data.modifiedTables]);
  showNotification(t('table.delete-ok', {n: indexes.length}));
}

/** Добавление новой записи. */
export async function addTableRecord(id: FormID, copy: boolean, index?: number): Promise<void> {
  const state = useTableStore.getState()[id];
  const { data, columns, selection, viewport } = state;

  const res = !copy && await channelAPI.getNewRow(data.queryID);
  if (!copy && res.ok === false) { showWarningMessage(res.message); return; }

  const activeRow = data.activeCell.row;
  if (index === undefined) index = activeRow !== null ? activeRow : 0;
  data.add(index, copy ? [...data.records[index].cells] : res.data);

  const editColumn = data.activeCell.column ?? columns.list[0].id;
  data.setActiveCell({row: index, column: editColumn, edited: true});
  selection.reset(index);
  useTableStore.setState({[id]: {...state}});
  viewport.scrollCellIntoView(index, editColumn);
}
