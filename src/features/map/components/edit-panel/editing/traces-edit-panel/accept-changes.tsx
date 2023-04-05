import {BigButton} from "../../../../../../shared/ui";
import applyTraceChangesIcon from "../../../../../../assets/images/trace/accept.png";
import {
  setTraceCreating,
  setTraceEditing,
} from "../../../../store/maps.actions";
import {useDispatch, useSelector} from "react-redux";
import {saveTraceThunk} from "../../../../store/traces.thunks";
import {updateParam} from "../../../../../../entities/parameters";
import {tableRowToString} from "../../../../../../entities/parameters/lib/table-row";
import {getCurrentTraceParamName, traceObjectToChannelRow} from "../../../../lib/traces-utils";

interface ApplyTraceChangesProps {
  mapState: MapState,
  formID: FormID,
  traces: Channel
}

export const ApplyTraceChanges = ({mapState, formID, traces}: ApplyTraceChangesProps) => {
  const dispatch = useDispatch();
  const { isTraceEditing, isTraceCreating } = mapState;

  // состояние активности кнопки
  const disabledAccept = !isTraceCreating && !isTraceEditing;

  // ID таблицы с трассами
  const tableID = traces.tableID;

  const currentTraceParamName = getCurrentTraceParamName(traces);

  // текущая трасса из store
  const currentTraceRow = mapState?.currentTraceRow;
  const newTraceRow = traceObjectToChannelRow(currentTraceRow);

  const rootID = useSelector<WState, string | null>(state => state.root.id);

  // onClick коллэк для компонента
  const action = () => {
    if (isTraceEditing) {
      if (newTraceRow.ID === null) return;

      // установка нового ID для редактирования трассы
      newTraceRow.ID = traces.data.rows.findIndex((row) => row.ID === currentTraceRow.ID);

      if(currentTraceRow) dispatch(saveTraceThunk(formID, tableID, 'update', newTraceRow));
      dispatch(setTraceEditing(formID, false));

      const currentTraceValue = tableRowToString(traces, newTraceRow)?.value;
      dispatch(updateParam(rootID, currentTraceParamName, currentTraceValue));
    }

    if (isTraceCreating) {
      if(currentTraceRow && currentTraceRow.Cells.items) {
        dispatch(saveTraceThunk(formID, tableID, 'create', newTraceRow));
      } else {
        dispatch(updateParam(rootID, currentTraceParamName, null));
      }
      dispatch(setTraceCreating(formID, false));
    }

    mapState.utils.updateCanvas();
  };

  return <BigButton
    text={'Применить'} icon={applyTraceChangesIcon}
    action={action} disabled={disabledAccept}
  />;
}
