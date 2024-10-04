import { useTranslation } from 'react-i18next';
import { createTrace } from '../../store/objects.thunks';
import { useCurrentPlace } from '../../store/objects.store';
import { BigButton } from 'shared/ui';
import createTraceIcon from 'assets/trace/create-trace.png';


interface CreateTraceProps {
  trace: ITraceManager;
  hasMap: boolean;
}


/** Кнопка создания трассы. */
export const CreateTrace = ({trace, hasMap}: CreateTraceProps) => {
  const { t } = useTranslation();
  const placeID = useCurrentPlace()?.id;

  const action = () => createTrace({id: null, place: placeID, name: '', nodes: []});
  const disabled = trace.editing || trace.creating || !placeID || !hasMap;

  return (
    <BigButton
      text={t('trace.create')} icon={createTraceIcon}
      onClick={action} disabled={disabled}
    />
  );
};
