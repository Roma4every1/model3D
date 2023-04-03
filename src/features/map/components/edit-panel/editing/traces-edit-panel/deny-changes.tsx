import {BigButton} from "../../../../../../shared/ui";
import denyTraceChangesIcon from "../../../../../../assets/images/trace/cancel.png";
import {
  setActiveLayer, setCurrentTrace, setTraceCreating,
  setTraceEditing, setTraceOldData
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

  const { isTraceEditing, isTraceCreating } = mapState;

  const currentTraceParamName = getCurrentTraceParamName(traces);

  // значения для проверки на активность кнопки
  const disabledDeny = !isTraceCreating && !isTraceEditing;

  // onClick коллэк для компонента
  const action = () => {
    if (isTraceEditing) {
      dispatch(setCurrentTrace(formID, mapState?.oldTraceDataRow));
      dispatch(setTraceOldData(formID, null));
      dispatch(setTraceEditing(formID, false));
    }

    if (isTraceCreating) {
      dispatch(updateParam(rootID, currentTraceParamName, null));
      dispatch(setCurrentTrace(formID, null));
      dispatch(setTraceCreating(formID, false));
    }

    // очистка элементов трасс на слое с трассами
    mapState.mapData.layers.find(layer => layer.uid==='{TRACES-LAYER}').elements = [];
    mapState.utils.updateCanvas();

    dispatch(setActiveLayer(formID, null));
  };

  return <BigButton
    text={'Отменить'} icon={denyTraceChangesIcon}
    action={action} disabled={disabledDeny}
  />;
}

