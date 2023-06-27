import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createTrace } from '../../store/traces.actions';
import { createTraceRow } from '../../store/traces.thunks';
import { currentStratumIDSelector } from '../../store/traces.selectors';
import { BigButton } from 'shared/ui';
import createTraceIcon from 'assets/images/trace/create-trace.png';


interface CreateTraceProps {
  tracesState: TracesState,
  tracesTableID: string | null
}


export const CreateTrace = ({tracesState, tracesTableID}: CreateTraceProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { isTraceEditing, isTraceCreating } = tracesState;
  const currentStratumID = useSelector(currentStratumIDSelector);
  const disabled = isTraceEditing || isTraceCreating || !currentStratumID;

  const action = () => {
    dispatch(createTrace(currentStratumID));
    dispatch(createTraceRow(tracesTableID, currentStratumID));
  };

  return (
    <BigButton
      text={t('trace.create')} icon={createTraceIcon}
      action={action} disabled={disabled}
    />
  );
};
