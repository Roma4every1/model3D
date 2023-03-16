import {BigButton} from "../../../../../../shared/ui";
import applyTraceChangesIcon from "../../../../../../assets/images/trace/accept.png";
import {acceptMapEditing, setActiveLayer, setCurrentTrace} from "../../../../store/maps.actions";
import {useDispatch, useSelector} from "react-redux";
import {saveTraceThunk} from "../../../../store/traces.thunks";
import {channelSelector} from "../../../../../../entities/channels";
import {useEffect} from "react";
import {updateParam} from "../../../../../../entities/parameters";
import {tableRowToString} from "../../../../../../entities/parameters/lib/table-row";

interface ApplyTraceChangesProps {
  mapState: MapState,
  formID: FormID,
}

export const ApplyTraceChanges = ({mapState, formID}: ApplyTraceChangesProps) => {
  const dispatch = useDispatch()
  const { oldData } = mapState;
  const disabledAccept = oldData.x === null && oldData.arc === null;

  // получение всех трасс из каналов
  const tracesChannelName = 'traces';
  const traces: Channel = useSelector(channelSelector.bind(tracesChannelName));

  // ID таблицы с трассами
  const tableID = traces.tableID

  // текущая трасса из store
  const currentTraceRow = mapState.currentTraceRow;
  const newTraceRow = {ID: null,
    Cells: [
      null,
      currentTraceRow?.Cells?.name,
      currentTraceRow?.Cells?.stratumID,
      currentTraceRow?.Cells?.items
    ]
  }

  const rootID = useSelector<WState, string | null>(state => state.root.id);

  const acceptEditing = () => {
    if(currentTraceRow) dispatch(saveTraceThunk(formID, tableID, 'create', newTraceRow));

    dispatch(acceptMapEditing(formID));
    dispatch(setActiveLayer(formID, null));
  };

  // обновление и установка в параметры новой трассы при её добавлении в каналах
  useEffect(() => {
    // получение последней добавленной трассы из каналов
    const tracesRows = traces.data.rows
    const lastTrace = tracesRows[tracesRows.length-1]
    const lastTraceValue = tableRowToString(traces, lastTrace)?.value;

    // установка текущей трассы в store
    dispatch(setCurrentTrace(formID,
      {ID: lastTrace.ID,
        Cells: {
          ID: lastTrace.Cells[0],
          name: lastTrace.Cells[1],
          stratumID: lastTrace.Cells[2],
          items: lastTrace.Cells[3]
        }
      }
    ));

    // обновление текущей трассы в параметрах
    dispatch(updateParam(rootID, 'currentTrace', lastTraceValue));
  }, [dispatch, formID, rootID, traces])

  return <BigButton
    text={'Применить'} icon={applyTraceChangesIcon}
    action={acceptEditing} disabled={disabledAccept}
  />;
}
