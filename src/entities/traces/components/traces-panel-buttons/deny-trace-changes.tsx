import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { removeTraceRow } from '../../store/traces.thunks';
import { setCurrentTraceData, setTraceCreating, setTraceEditing } from '../../store/traces.actions';
import { BigButton } from 'shared/ui';
import denyTraceChangesIcon from 'assets/images/trace/cancel.png';


interface DenyTraceChangesProps {
  traces: Channel,
  tracesState: TracesState,
  itemsTableID: TableID,
}


export const DenyTraceChanges = ({traces, tracesState, itemsTableID}: DenyTraceChangesProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { isTraceEditing, isTraceCreating, oldTraceData } = tracesState;
  const disabledDeny = !isTraceCreating && !isTraceEditing;

  const action = () => {
    if (isTraceEditing) {
      dispatch(setCurrentTraceData(oldTraceData));
    }
    if (isTraceCreating) {
      const id = tracesState.currentTraceData.id;
      const deleteID = traces.data.rows.findIndex((row) => row.Cells[0] === id);

      dispatch(removeTraceRow(traces.tableID, deleteID, itemsTableID, tracesState.isTraceCreating));
      dispatch(setCurrentTraceData(null));
      dispatch(setTraceCreating(false));
    }
    dispatch(setTraceEditing(false));
  };

  return (
    <BigButton
      text={t('base.cancel')} icon={denyTraceChangesIcon}
      action={action} disabled={disabledDeny}
    />
  );
};

