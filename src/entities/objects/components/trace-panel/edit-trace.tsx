import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setCurrentTrace } from '../../index';
import { BigButton } from 'shared/ui';
import editTraceIcon from 'assets/images/trace/edit-trace.png'


interface EditTraceProps {
  trace: TraceState,
}


export const EditTrace = ({trace}: EditTraceProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const action = () => {
    dispatch(setCurrentTrace(undefined, undefined, true));
  };

  return (
    <BigButton
      text={t('trace.edit')} icon={editTraceIcon}
      action={action} disabled={!trace.model || trace.editing || trace.creating}
    />
  );
};
