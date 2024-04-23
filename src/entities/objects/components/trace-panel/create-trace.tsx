import { useTranslation } from 'react-i18next';
import { createTrace } from '../../store/objects.thunks';
import { useCurrentPlaceModel } from '../../store/objects.store';
import { BigButton } from 'shared/ui';
import createTraceIcon from 'assets/images/trace/create-trace.png';


interface CreateTraceProps {
  trace: TraceState;
  hasMap: boolean;
}


/** Кнопка создания трассы. */
export const CreateTrace = ({trace, hasMap}: CreateTraceProps) => {
  const { t } = useTranslation();
  const placeID = useCurrentPlaceModel()?.id;

  const action = () => createTrace({id: null, place: placeID, name: '', nodes: []});
  const disabled = trace.editing || trace.creating || !placeID || !hasMap;

  return (
    <BigButton
      text={t('trace.create')} icon={createTraceIcon}
      action={action} disabled={disabled}
    />
  );
};
