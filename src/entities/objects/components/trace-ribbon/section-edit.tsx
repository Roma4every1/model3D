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
  const apply = () => {
    if (!manager.editing) return;
    const model = manager.model;
    if (!model.name) model.name = model.nodes.map(n => n.name).join(',');
    saveTrace().then();
  };
  const cancel = () => {
    if (manager.creating) {
      deleteTrace().then();
    } else {
      setCurrentTrace(manager.oldModel, false, false);
    }
  };
  const disabled = !manager.creating && !manager.editing;

  return (
    <MenuSection header={t('trace.edit-section')} className={'big-buttons'}>
      <BigButton
        text={t('base.apply')} icon={applyIcon}
        onClick={apply} disabled={disabled}
      />
      <BigButton
        text={t('base.cancel')} icon={cancelIcon}
        onClick={cancel} disabled={disabled}
      />
    </MenuSection>
  );
};
