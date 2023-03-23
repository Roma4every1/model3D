import {BigButton} from "../../../../../../shared/ui";
import applyTraceChangesIcon from "../../../../../../assets/images/trace/accept.png";
import {
  acceptMapEditing,
  setActiveLayer,
  setCurrentTrace,
  setTraceEditing
} from "../../../../store/maps.actions";
import {useDispatch, useSelector} from "react-redux";
import {saveTraceThunk} from "../../../../store/traces.thunks";
import {useEffect} from "react";
import {updateParam} from "../../../../../../entities/parameters";
import {tableRowToString} from "../../../../../../entities/parameters/lib/table-row";
import {getCurrentTraceParamName} from "../../../../lib/traces-utils";

interface ApplyTraceChangesProps {
  mapState: MapState,
  formID: FormID,
  traces: Channel
}

export const ApplyTraceChanges = ({mapState, formID, traces}: ApplyTraceChangesProps) => {
  const dispatch = useDispatch()
  const { oldData, isTraceEditing } = mapState;

  const isTraceCreating = oldData.arc !== null
  const disabledAccept = !isTraceCreating && !isTraceEditing;

  // ID таблицы с трассами
  const tableID = traces.tableID

  const currentTraceParamName = getCurrentTraceParamName(traces);

  // текущая трасса из store
  const currentTraceRow = mapState.currentTraceRow;
  const newTraceRow = {ID: currentTraceRow?.ID,
    Cells: [
      currentTraceRow?.Cells?.ID,
      currentTraceRow?.Cells?.name,
      currentTraceRow?.Cells?.stratumID,
      currentTraceRow?.Cells?.items
    ]
  }

  const rootID = useSelector<WState, string | null>(state => state.root.id);

  const acceptEditing = () => {
    let method : 'create' | 'update' = 'create';
    if (newTraceRow.ID !== null) {
      const editID = traces.data.rows.findIndex((row) => row.ID === currentTraceRow.ID);
      method = 'update';
      newTraceRow.ID = editID;
    }

    if(currentTraceRow) dispatch(saveTraceThunk(formID, tableID, method, newTraceRow));

    if (isTraceEditing) dispatch(setTraceEditing(formID, false))
    dispatch(acceptMapEditing(formID));
    dispatch(setActiveLayer(formID, null));
    // updateCurrentTraceParams();
  };

  // обновление и установка в параметры новой трассы при её добавлении в каналах
  useEffect(() => {
    if (!traces.data.rows) return;
    if (!mapState?.isModified) return;


    // получение последней добавленной трассы из каналов
    const tracesRows = traces.data.rows
    const lastTrace = tracesRows[tracesRows.length-1]
    const lastTraceValue = tableRowToString(traces, lastTrace)?.value;

    // КОСТЫЛЬ!
    if (currentTraceRow.Cells.items !== lastTrace.Cells[3]) return;

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
    dispatch(updateParam(rootID, currentTraceParamName, lastTraceValue));
  }, [dispatch, formID, rootID, traces])

  return <BigButton
    text={'Применить'} icon={applyTraceChangesIcon}
    action={acceptEditing} disabled={disabledAccept}
  />;
}
