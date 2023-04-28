import applyTraceChangesIcon from "../../../../assets/images/trace/accept.png";
import {useDispatch} from "react-redux";
import {BigButton} from "../../../../shared/ui";
import {setTraceCreating, setTraceEditing} from "../../store/traces.actions";
import {updateTraceData, updateTraceItems} from "../../store/traces.thunks";
import {useTranslation} from "react-i18next";


interface ApplyTraceChangesProps {
  traces: Channel,
  tracesState: TracesState,
  itemsTableID: TableID
}

export const ApplyTraceChanges = ({traces, tracesState, itemsTableID}: ApplyTraceChangesProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { isTraceEditing, isTraceCreating, currentTraceData } = tracesState;

  // состояние активности кнопки
  const disabledAccept = !isTraceCreating && !isTraceEditing;

  // ID таблицы с трассами
  const tableID = traces.tableID;

  // onClick коллбэк для компонента
  const action = () => {
    if (isTraceEditing) {
      // получение индекса в таблице ряда с выбранной трассой
      const updateID = traces.data.rows.findIndex((row) => row.Cells[0] === currentTraceData.id);

      dispatch(updateTraceItems(itemsTableID, currentTraceData.id, currentTraceData.items, isTraceCreating));
      dispatch(updateTraceData(tableID, currentTraceData, updateID));
    }
    if (isTraceCreating) dispatch(setTraceCreating(false));
    dispatch(setTraceEditing(false));
  };

  return <BigButton
    text={t('base.apply')} icon={applyTraceChangesIcon}
    action={action} disabled={disabledAccept}
  />;
}
