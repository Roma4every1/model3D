import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { traceStateSelector } from '../../index';

import { MenuSection } from 'shared/ui';
import { EditTrace } from './edit-trace';
import { DeleteTrace } from './delete-trace';
import { CreateTrace } from './create-trace';
import { ApplyTraceChanges } from './apply-trace-changes';
import { DenyTraceChanges } from './deny-trace-changes';


/** Верхняя панель трасс. */
export const TracePanel = () => {
  const { t } = useTranslation();
  const trace = useSelector(traceStateSelector);

  return (
    <div className={'menu'}>
      <MenuSection header={t('trace.controls-section')} className={'big-buttons'}>
        <CreateTrace trace={trace}/>
        <DeleteTrace trace={trace}/>
        <EditTrace trace={trace}/>
      </MenuSection>
      <MenuSection header={t('trace.edit-section')} className={'big-buttons'}>
        <ApplyTraceChanges trace={trace}/>
        <DenyTraceChanges trace={trace}/>
      </MenuSection>
    </div>
  );
};
