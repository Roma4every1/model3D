import {useDispatch, useSelector} from "react-redux";
import createTraceIcon from '../../../../assets/images/trace/trace_add_L.png'
import {BigButton} from "../../../../shared/ui";
import {createTrace} from "../../store/traces.actions";
import {createTraceRow} from "../../store/traces.thunks";
import {stringToTableCell} from "../../../parameters/lib/table-row";
import {currentMestParamName} from "../../lib/constants";

interface CreateTraceProps {
  tracesState: TracesState,
  tracesTableID: string | null
}

export const CreateTrace = ({tracesState, tracesTableID}: CreateTraceProps) => {
  const dispatch = useDispatch();
  const { isTraceEditing, isTraceCreating } = tracesState;

  // текущее месторождение, используется для получения stratumID
  const currentMestValue = useSelector<WState, string | null>(
    (state: WState) =>
      state.parameters[state.root.id]
        .find(el => el.id === currentMestParamName)
        ?.value?.toString() || null
  );

  // получение stratumID
  const currentStratumID = currentMestValue ?
    stringToTableCell(currentMestValue, 'LOOKUPCODE') : null;

  // состояние активности кнопки
  const disabled = isTraceEditing ||
    isTraceCreating || !currentMestValue;

  // onClick коллбэк для компонента
  const action = () => {
    dispatch(createTrace(currentStratumID));
    dispatch(createTraceRow(tracesTableID, currentStratumID));
  }

  return <BigButton
    text={'Создать'} icon={createTraceIcon}
    action={action} disabled={disabled}
  />;
}
