import {BigButton} from "../../../../../../shared/ui";
import denyTraceChangesIcon from "../../../../../../assets/images/trace/cancel.png";
import {
  cancelMapEditing,
  setActiveLayer,
  setCurrentTrace
} from "../../../../store/maps.actions";
import {useDispatch, useSelector} from "react-redux";
import {updateParam} from "../../../../../../entities/parameters";

interface DenyTraceChangesProps {
  mapState: MapState,
  formID: FormID,
}

export const DenyTraceChanges = ({mapState, formID}: DenyTraceChangesProps) => {
  const dispatch = useDispatch();

  const { oldData } = mapState;

  // значения для проверки на активность кнопки
  const disabledDeny = oldData.x === null && oldData.arc === null;

  const rootID = useSelector<WState, string | null>(state => state.root.id);

  const cancelEditing = () => {
    mapState.mapData.layers.find(layer => layer.uid==='{TRACES-LAYER}').elements = [];
    dispatch(updateParam(rootID, 'currentTrace', null));
    dispatch(setCurrentTrace(formID, null))
    dispatch(cancelMapEditing(formID));
    dispatch(setActiveLayer(formID, null));
  };

  return <BigButton
    text={'Отменить'} icon={denyTraceChangesIcon}
    action={cancelEditing} disabled={disabledDeny}
  />;
}

