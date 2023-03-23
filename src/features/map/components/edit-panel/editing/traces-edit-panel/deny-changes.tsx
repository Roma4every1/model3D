import {BigButton} from "../../../../../../shared/ui";
import denyTraceChangesIcon from "../../../../../../assets/images/trace/cancel.png";
import {
  cancelMapEditing,
  setActiveLayer,
  setTraceEditing
} from "../../../../store/maps.actions";
import {useDispatch} from "react-redux";
import {updateParam} from "../../../../../../entities/parameters";
import {getCurrentTraceParamName} from "../../../../lib/traces-utils";

interface DenyTraceChangesProps {
  mapState: MapState,
  formID: FormID,
  rootID: string | null,
  traces: Channel
}

export const DenyTraceChanges = ({mapState, formID, rootID, traces}: DenyTraceChangesProps) => {
  const dispatch = useDispatch();

  const { oldData, isTraceEditing } = mapState;

  const currentTraceParamName = getCurrentTraceParamName(traces);

  // значения для проверки на активность кнопки
  const isTraceCreating = oldData.arc !== null
  const disabledDeny = !isTraceCreating && !isTraceEditing;

  const cancelEditing = () => {
    if (isTraceCreating) {
      // КОСТЫЛЬ!
      dispatch(updateParam(rootID, currentTraceParamName, null));
    }
    mapState.mapData.layers.find(layer => layer.uid==='{TRACES-LAYER}').elements = [];

    dispatch(setTraceEditing(formID, false))
    dispatch(cancelMapEditing(formID));
    dispatch(setActiveLayer(formID, null));
  };

  return <BigButton
    text={'Отменить'} icon={denyTraceChangesIcon}
    action={cancelEditing} disabled={disabledDeny}
  />;
}

