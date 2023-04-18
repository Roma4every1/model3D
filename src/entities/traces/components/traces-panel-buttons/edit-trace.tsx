import editTraceIcon from '../../../../assets/images/trace/trace_edit_L.png'
import {useDispatch} from "react-redux";
import {BigButton} from "../../../../shared/ui";
import {setTraceEditing} from "../../store/traces.actions";

interface EditTraceProps {
  tracesState: TracesState
}

export const EditTrace = ({tracesState}: EditTraceProps) => {
  const dispatch = useDispatch();

  const { isTraceEditing, isTraceCreating } = tracesState;

  // состояние активности кнопки
  const disabled = !tracesState?.currentTraceData ||
    isTraceEditing ||
    isTraceCreating;

  // onClick коллбэк для компонента
  const action = () => {
    dispatch(setTraceEditing(true));
  }

  return <BigButton
    text={'Редактирование'} icon={editTraceIcon}
    action={action} disabled={disabled}
  />;
}
