import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { deleteTrace, setCurrentTrace } from '../../index';
import { BigButton } from 'shared/ui';
import denyTraceChangesIcon from 'assets/images/trace/cancel.png';


interface DenyTraceChangesProps {
  trace: TraceState,
}


export const DenyTraceChanges = ({trace}: DenyTraceChangesProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const action = () => {
    if (trace.editing) {
      dispatch(setCurrentTrace(trace.oldModel, undefined, false));
    }
    else if (trace.creating) {
      dispatch(deleteTrace());
      dispatch(setCurrentTrace(null, false, false));
    }
  };

  return (
    <BigButton
      text={t('base.cancel')} icon={denyTraceChangesIcon}
      action={action} disabled={!trace.creating && !trace.editing}
    />
  );
};
