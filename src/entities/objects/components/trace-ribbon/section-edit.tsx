import type { TFunction } from 'react-i18next';
import { TraceManager } from '../../lib/trace';
import { setCurrentTrace } from '../../store/objects.actions';
import { deleteTrace, saveTrace } from '../../store/trace.thunks';
import { MenuSection, BigButton } from 'shared/ui';
import applyIcon from 'assets/objects/apply.png';
import cancelIcon from 'assets/objects/cancel.png';


interface TraceEditSectionProps {
  manager: TraceManager;
  t: TFunction;
}

export const TraceEditSection = ({manager, t}: TraceEditSectionProps) => {
  const trace = manager.model;
  const disabled = !manager.creating && !manager.editing;

  const apply = () => {
    if (!manager.editing) return;
    if (!trace.name) trace.name = trace.nodes.map(n => n.name).join(',');
    saveTrace().then();
  };
  const cancel = () => {
    if (manager.creating) {
      deleteTrace().then();
    } else {
      setCurrentTrace(manager.oldModel, false, false);
    }
  };

  return (
    <MenuSection header={t('trace.edit-section')} className={'big-buttons'}>
      <BigButton
        text={t('base.apply')} icon={applyIcon}
        onClick={apply} disabled={disabled || (trace && trace.nodes.length < 2)}
      />
      <BigButton
        text={t('base.cancel')} icon={cancelIcon}
        onClick={cancel} disabled={disabled}
      />
    </MenuSection>
  );
};
