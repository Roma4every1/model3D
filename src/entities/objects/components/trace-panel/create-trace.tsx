import { useDispatch, useSelector } from 'shared/lib';
import { useTranslation } from 'react-i18next';
import { createTrace, currentPlaceSelector } from '../../index';
import { BigButton } from 'shared/ui';
import createTraceIcon from 'assets/images/trace/create-trace.png';


interface CreateTraceProps {
  trace: TraceState,
}


/** Кнопка создания трассы. */
export const CreateTrace = ({trace}: CreateTraceProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const currentPlace = useSelector(currentPlaceSelector);
  const placeID = currentPlace?.id;
  const disabled = trace.editing || trace.creating || !placeID;

  const action = () => {
    dispatch(createTrace({id: null, place: placeID, name: 'Без имени', nodes: []}));
  };

  return (
    <BigButton
      text={t('trace.create')} icon={createTraceIcon}
      action={action} disabled={disabled}
    />
  );
};
