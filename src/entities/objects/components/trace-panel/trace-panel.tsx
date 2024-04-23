import { useTranslation } from 'react-i18next';
import { useCurrentTrace } from '../../store/objects.store';

import { MenuSection } from 'shared/ui';
import { EditTrace } from './edit-trace';
import { DeleteTrace } from './delete-trace';
import { CreateTrace } from './create-trace';
import { ApplyTraceChanges } from './apply-trace-changes';
import { DenyTraceChanges } from './deny-trace-changes';


interface TracePanelProps {
  /** Есть ли на активной презентации карта. */
  hasMap: boolean;
}


/** Верхняя панель трасс. */
export const TracePanel = ({hasMap}: TracePanelProps) => {
  const { t } = useTranslation();
  const trace = useCurrentTrace();

  return (
    <div className={'menu'}>
      <MenuSection header={t('trace.controls-section')} className={'big-buttons'}>
        <CreateTrace trace={trace} hasMap={hasMap}/>
        <DeleteTrace trace={trace}/>
        <EditTrace trace={trace} hasMap={hasMap}/>
      </MenuSection>
      <MenuSection header={t('trace.edit-section')} className={'big-buttons'}>
        <ApplyTraceChanges trace={trace}/>
        <DenyTraceChanges trace={trace}/>
      </MenuSection>
    </div>
  );
};
