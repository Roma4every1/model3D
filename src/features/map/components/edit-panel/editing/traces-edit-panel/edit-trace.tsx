import {BigButton} from "../../../../../../shared/ui";
import editTraceIcon from './../../../../../../assets/images/trace/trace_edit_L.png'
import {
  setTraceEditing,
} from "../../../../store/maps.actions";
import {useDispatch} from "react-redux";

interface EditTraceProps {
  mapState: MapState,
  formID: FormID,
}

export const EditTrace = ({formID, mapState}: EditTraceProps) => {
  const dispatch = useDispatch()

  const disabled = !mapState ||
    !mapState?.currentTraceRow ||
    mapState?.isTraceEditing ||
    mapState?.isElementEditing;

  const action = () => {
    dispatch(setTraceEditing(formID, true));
  }

  return <BigButton
    text={'Редактирование'} icon={editTraceIcon}
    action={action} disabled={disabled}
  />;
}
