import { useTranslation } from 'react-i18next';
import { setCurrentTrace } from '../../store/objects.actions';
import { BigButton } from 'shared/ui';
import editTraceIcon from 'assets/images/trace/edit-trace.png';


interface EditTraceProps {
  /** Состояние трасс. */
  trace: TraceState;
  /** Есть ли на активной презентации карта. */
  hasMap: boolean;
}


export const EditTrace = ({trace, hasMap}: EditTraceProps) => {
  const { t } = useTranslation();
  const action = () => setCurrentTrace(undefined, undefined, true);

  return (
    <BigButton
      text={t('trace.edit')} icon={editTraceIcon}
      action={action} disabled={!trace.model || trace.editing || trace.creating || !hasMap}
    />
  );
};
