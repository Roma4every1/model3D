import { useTranslation } from 'react-i18next';
import { createTrace } from '../../store/objects.thunks';
import { BigButton } from 'shared/ui';
import createTraceIcon from 'assets/trace/create-trace.png';


interface CreateTraceProps {
  traceManager: ITraceManager;
  hasMap: boolean;
}


/** Кнопка создания трассы. */
export const CreateTrace = ({traceManager, hasMap}: CreateTraceProps) => {
  const { t } = useTranslation();
  const disabled = traceManager.editing || traceManager.creating || !hasMap;

  return (
    <BigButton
      text={t('trace.create')} icon={createTraceIcon}
      onClick={createTrace} disabled={disabled}
    />
  );
};
