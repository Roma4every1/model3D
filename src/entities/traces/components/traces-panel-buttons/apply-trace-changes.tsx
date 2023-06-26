import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateTraceData, updateTraceItems } from '../../store/traces.thunks';
import { setTraceCreating, setTraceEditing } from '../../store/traces.actions';
import { BigButton } from 'shared/ui';
import applyTraceChangesIcon from 'assets/images/trace/accept.png';


interface ApplyTraceChangesProps {
  traces: Channel,
  tracesState: TracesState,
  itemsTableID: TableID
}


export const ApplyTraceChanges = ({traces, tracesState, itemsTableID}: ApplyTraceChangesProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { isTraceEditing, isTraceCreating, currentTraceData } = tracesState;
  const disabledAccept = !isTraceCreating && !isTraceEditing;

  const action = () => {
    if (isTraceEditing) {
      // получение индекса в таблице ряда с выбранной трассой
      const updateID = traces.data.rows.findIndex((row) => row.Cells[0] === currentTraceData.id);

      dispatch(updateTraceItems(itemsTableID, currentTraceData.id, currentTraceData.items, isTraceCreating));
      dispatch(updateTraceData(traces.tableID, currentTraceData, updateID));
    }
    if (isTraceCreating) dispatch(setTraceCreating(false));
    dispatch(setTraceEditing(false));
  };

  return (
    <BigButton
      text={t('base.apply')} icon={applyTraceChangesIcon}
      action={action} disabled={disabledAccept}
    />
  );
};
