import {useDispatch, useSelector} from "react-redux";
import createTraceIcon from '../../../../assets/images/trace/trace_add_L.png'
import {BigButton} from "../../../../shared/ui";
import {createTrace} from "../../store/traces.actions";
import {createTraceRow} from "../../store/traces.thunks";
import {useTranslation} from "react-i18next";
import {currentStratumIDSelector} from "../../store/traces.selectors";

interface CreateTraceProps {
  tracesState: TracesState,
  tracesTableID: string | null
}

export const CreateTrace = ({tracesState, tracesTableID}: CreateTraceProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { isTraceEditing, isTraceCreating } = tracesState;

  // получение stratumID
  const currentStratumID = useSelector(currentStratumIDSelector);

  // состояние активности кнопки
  const disabled = isTraceEditing ||
    isTraceCreating || !currentStratumID;

  // onClick коллбэк для компонента
  const action = () => {
    dispatch(createTrace(currentStratumID));
    dispatch(createTraceRow(tracesTableID, currentStratumID));
  }

  return <BigButton
    text={t('trace.create')} icon={createTraceIcon}
    action={action} disabled={disabled}
  />;
}
