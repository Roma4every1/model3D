import denyTraceChangesIcon from "../../../../assets/images/trace/cancel.png";
import {useDispatch} from "react-redux";
import {BigButton} from "../../../../shared/ui";
import {setCurrentTraceData, setTraceCreating, setTraceEditing} from "../../store/traces.actions";
import {removeTraceRow} from "../../store/traces.thunks";
import {useTranslation} from "react-i18next";


interface DenyTraceChangesProps {
  traces: Channel,
  tracesState: TracesState,
  itemsTableID: TableID,
}

export const DenyTraceChanges = ({traces, tracesState, itemsTableID}: DenyTraceChangesProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const { isTraceEditing, isTraceCreating, oldTraceData } = tracesState;

  // состояние активности кнопки
  const disabledDeny = !isTraceCreating && !isTraceEditing;

  // onClick коллбэк для компонента
  const action = () => {
    if (isTraceEditing) {
      dispatch(setCurrentTraceData(oldTraceData));
    }
    if (isTraceCreating) {
      const deleteID = traces.data.rows.findIndex((row) =>
        row.Cells[0] === tracesState.currentTraceData.id);
      dispatch(removeTraceRow(traces.tableID, deleteID, itemsTableID, tracesState.isTraceCreating));
      dispatch(setCurrentTraceData(null));
      dispatch(setTraceCreating(false));
    }
    dispatch(setTraceEditing(false));
  };

  return <BigButton
    text={t('base.cancel')} icon={denyTraceChangesIcon}
    action={action} disabled={disabledDeny}
  />;
}

