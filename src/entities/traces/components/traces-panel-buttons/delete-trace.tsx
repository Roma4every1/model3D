import deleteTraceIcon from '../../../../assets/images/trace/trace_remove_L.png'
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {useCallback} from "react";

import {Dialog, DialogActionsBar} from "@progress/kendo-react-dialogs";
import {Button} from "@progress/kendo-react-buttons";
import {setOpenedWindow} from "../../../windows";
import {BigButton} from "../../../../shared/ui";
import {removeTraceRow} from "../../store/traces.thunks";
import {setCurrentTraceData} from "../../store/traces.actions";

interface DeleteTraceProps {
  traces: Channel,
  tracesState: TracesState,
  itemsTableID: TableID
}

export const DeleteTrace = ({traces, tracesState, itemsTableID}: DeleteTraceProps) => {
  const dispatch = useDispatch();
  const { isTraceEditing, isTraceCreating } = tracesState;

  // получение значения текущей трассы из store
  const currentTraceData = tracesState.currentTraceData;

  // состояние активности кнопки
  const disabled = !currentTraceData ||
    isTraceEditing ||
    isTraceCreating;

  // onClick коллбэк для компонента
  const showDeleteTraceWindow = () => {
    const name = 'traceDeleteWindow';
    const window = <DeleteTraceWindow
      key={name}
      tracesState={tracesState}
      traces={traces}
      itemsTableID={itemsTableID}
    />;
    dispatch(setOpenedWindow(name, true, window));
  };

  return <BigButton
    text={'Удалить'} icon={deleteTraceIcon}
    action={showDeleteTraceWindow} disabled={disabled}
  />;
}

interface DeleteTraceWindowProps {
  tracesState: TracesState,
  traces: Channel,
  itemsTableID: TableID
}

export const DeleteTraceWindow = ({tracesState, traces, itemsTableID}: DeleteTraceWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const traceName = tracesState.currentTraceData.name
  const closeDeleteWindow = useCallback(() => {
    dispatch(setOpenedWindow('traceDeleteWindow', false, null));
  }, [dispatch]);

  // onClick коллбэк для компонента
  const handleDelete = useCallback(() => {
    const deleteID = traces.data.rows.findIndex((row) =>
      row.Cells[0] === tracesState.currentTraceData.id);
    dispatch(removeTraceRow(traces.tableID, deleteID, itemsTableID));
    dispatch(setCurrentTraceData(null))

    closeDeleteWindow();
  }, [closeDeleteWindow, dispatch, itemsTableID, traces.data.rows,
    traces.tableID, tracesState.currentTraceData.id]);

  return (
    <Dialog
      key={'traceDeleteWindow'}
      title={t('map.delete-element')}
      onClose={closeDeleteWindow}
    >
      <div>{t('map.areYouSureToDeleteTrace')}</div>
      <ul style={{paddingLeft: '16px'}}>
        <li><b>Трасса: </b><span>{traceName}</span></li>
      </ul>
      <DialogActionsBar>
        <div className={'windowButtonContainer'}>
          <Button className={'windowButton'} onClick={handleDelete}>
            {t('base.yes')}
          </Button>
        </div>
        <div className={'windowButtonContainer'}>
          <Button className={'windowButton'} onClick={closeDeleteWindow}>
            {t('base.no')}
          </Button>
        </div>
      </DialogActionsBar>
    </Dialog>
  );
};
