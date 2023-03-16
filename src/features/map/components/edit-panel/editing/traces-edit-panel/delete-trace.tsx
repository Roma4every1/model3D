import {BigButton} from "../../../../../../shared/ui";
import deleteTraceIcon from './../../../../../../assets/images/trace/trace_remove_L.png'
import {useDispatch, useSelector} from "react-redux";
import {deleteTraceThunk} from "../../../../store/traces.thunks";
import {channelSelector} from "../../../../../../entities/channels";

interface DeleteTraceProps {
  mapState: MapState,
  formID: FormID,
}

export const DeleteTrace = ({mapState, formID}: DeleteTraceProps) => {
  const dispatch = useDispatch();

  // получение всех трасс из каналов
  const tracesChannelName = 'traces';
  const traces: Channel = useSelector(channelSelector.bind(tracesChannelName));
  const tableID = traces.tableID;

  // получение значения текущей трассы из store
  const currentTraceRow = mapState.currentTraceRow;

  const action = () => {
    if(!currentTraceRow) return;
    const deleteID = traces.data.rows.findIndex((row) => row.ID === currentTraceRow.ID);
    dispatch(deleteTraceThunk(formID, tableID, deleteID));
  };

  return <BigButton
    text={'Удалить'} icon={deleteTraceIcon}
    action={action} disabled={currentTraceRow === null}
  />;
}
