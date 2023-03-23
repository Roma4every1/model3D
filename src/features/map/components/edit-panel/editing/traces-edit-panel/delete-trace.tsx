import {BigButton} from "../../../../../../shared/ui";
import deleteTraceIcon from './../../../../../../assets/images/trace/trace_remove_L.png'
import {useDispatch} from "react-redux";
import {deleteTraceThunk} from "../../../../store/traces.thunks";

interface DeleteTraceProps {
  mapState: MapState,
  formID: FormID,
  traces: Channel
}

export const DeleteTrace = ({mapState, formID, traces}: DeleteTraceProps) => {
  const dispatch = useDispatch();

  // получение всех трасс из каналов
  const tableID = traces.tableID;

  const isTraceEditing = mapState?.isTraceEditing;

  // получение значения текущей трассы из store
  const currentTraceRow = mapState.currentTraceRow;

  const disabled = !currentTraceRow ||
    isTraceEditing ||
    mapState?.isElementEditing;

  const action = () => {
    if(!currentTraceRow) return;
    const deleteID = traces.data.rows.findIndex((row) => row.ID === currentTraceRow.ID);
    dispatch(deleteTraceThunk(formID, tableID, deleteID));
  };

  return <BigButton
    text={'Удалить'} icon={deleteTraceIcon}
    action={action} disabled={disabled}
  />;
}
