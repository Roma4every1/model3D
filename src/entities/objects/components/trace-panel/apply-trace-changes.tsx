import { useTranslation } from 'react-i18next';
import { saveTrace } from '../../store/objects.thunks';
import { BigButton } from 'shared/ui';
import applyTraceChangesIcon from 'assets/trace/accept.png';


interface ApplyTraceChangesProps {
  trace: ITraceManager,
}


export const ApplyTraceChanges = ({trace}: ApplyTraceChangesProps) => {
  const { t } = useTranslation();

  const apply = () => {
    if (!trace.editing) return;
    const model = trace.model;
    if (!model.name) model.name = model.nodes.map(n => n.name).join(',');
    saveTrace().then();
  };

  return (
    <BigButton
      text={t('base.apply')} icon={applyTraceChangesIcon}
      onClick={apply} disabled={!trace.creating && !trace.editing}
    />
  );
};
