import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setOpenedWindow } from '../../../windows';
import { removeTraceRow } from '../../store/traces.thunks';
import { setCurrentTraceData } from '../../store/traces.actions';

import { BigButton } from 'shared/ui';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import deleteTraceIcon from 'assets/images/trace/detele-trace.png';


interface DeleteTraceProps {
  traces: Channel,
  tracesState: TracesState,
  itemsTableID: TableID,
}
interface DeleteTraceWindowProps {
  tracesState: TracesState,
  traces: Channel,
  itemsTableID: TableID,
}


export const DeleteTrace = ({traces, tracesState, itemsTableID}: DeleteTraceProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { isTraceEditing, isTraceCreating } = tracesState;
  const disabled = !tracesState.currentTraceData || isTraceEditing || isTraceCreating;

  const showDeleteTraceWindow = () => {
    const window = (
      <DeleteTraceWindow
        key={'traceDeleteWindow'} itemsTableID={itemsTableID}
        tracesState={tracesState} traces={traces}
      />
    );
    dispatch(setOpenedWindow('traceDeleteWindow', true, window));
  };

  return (
    <BigButton
      text={t('trace.delete')} icon={deleteTraceIcon}
      action={showDeleteTraceWindow} disabled={disabled}
    />
  );
}

export const DeleteTraceWindow = ({tracesState, traces, itemsTableID}: DeleteTraceWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const closeDeleteWindow = () => {
    dispatch(setOpenedWindow('traceDeleteWindow', false, null));
  };

  const handleDelete = () => {
    const id = tracesState.currentTraceData.id;
    const deleteID = traces.data.rows.findIndex((row) => row.Cells[0] === id);

    dispatch(removeTraceRow(traces.tableID, deleteID, itemsTableID));
    dispatch(setCurrentTraceData(null));
    closeDeleteWindow();
  };

  return (
    <Dialog key={'traceDeleteWindow'} title={t('trace.delete-dialog')} onClose={closeDeleteWindow}>
      <div>{t('trace.areYouSureToDeleteTrace')}</div>
      <ul style={{paddingLeft: '16px'}}>
        <li style={{fontWeight: 'bold'}}>{tracesState.currentTraceData.name}</li>
      </ul>
      <DialogActionsBar>
        <div className={'windowButtonContainer'}>
          <Button className={'windowButton'} onClick={handleDelete}>{t('base.yes')}</Button>
        </div>
        <div className={'windowButtonContainer'}>
          <Button className={'windowButton'} onClick={closeDeleteWindow}>{t('base.no')}</Button>
        </div>
      </DialogActionsBar>
    </Dialog>
  );
};
