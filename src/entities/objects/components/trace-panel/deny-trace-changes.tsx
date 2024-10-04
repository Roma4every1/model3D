import { useTranslation } from 'react-i18next';
import { deleteTrace, setCurrentTrace } from '../../index';
import { BigButton } from 'shared/ui';
import denyTraceChangesIcon from 'assets/trace/cancel.png';


interface DenyTraceChangesProps {
  trace: ITraceManager,
}


export const DenyTraceChanges = ({trace}: DenyTraceChangesProps) => {
  const { t } = useTranslation();

  const action = () => {
    if (trace.creating) {
      deleteTrace().then();
    } else {
      setCurrentTrace(trace.oldModel, false, false);
    }
  };

  return (
    <BigButton
      text={t('base.cancel')} icon={denyTraceChangesIcon}
      onClick={action} disabled={!trace.creating && !trace.editing}
    />
  );
};
