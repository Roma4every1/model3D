import { useDispatch } from 'shared/lib';
import { useTranslation } from 'react-i18next';
import { saveTrace } from '../../store/objects.thunks';
import { BigButton } from 'shared/ui';
import applyTraceChangesIcon from 'assets/images/trace/accept.png';


interface ApplyTraceChangesProps {
  trace: TraceState,
}


export const ApplyTraceChanges = ({trace}: ApplyTraceChangesProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const action = () => {
    if (!trace.editing) return;
    const model = trace.model;
    if (!model.name) model.name = model.nodes.map(n => n.name).join(',');
    dispatch(saveTrace());
  };

  return (
    <BigButton
      text={t('base.apply')} icon={applyTraceChangesIcon}
      action={action} disabled={!trace.creating && !trace.editing}
    />
  );
};
