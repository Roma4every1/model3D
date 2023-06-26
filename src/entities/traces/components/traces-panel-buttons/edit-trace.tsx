import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setTraceEditing } from '../../store/traces.actions';
import { BigButton } from 'shared/ui';
import editTraceIcon from 'assets/images/trace/trace_edit_L.png'


interface EditTraceProps {
  tracesState: TracesState
}


export const EditTrace = ({tracesState}: EditTraceProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { isTraceEditing, isTraceCreating } = tracesState;
  const disabled = !tracesState?.currentTraceData || isTraceEditing || isTraceCreating;
  const action = () => { dispatch(setTraceEditing(true)); };

  return (
    <BigButton
      text={t('trace.edit')} icon={editTraceIcon}
      action={action} disabled={disabled}
    />
  );
};
