import { useTranslation } from 'react-i18next';
import { useTraceManager } from '../../store/objects.store';
import { TraceManageSection } from './section-manage';
import { TraceEditSection } from './section-edit';


interface TracePanelProps {
  /** Есть ли на активной презентации карта. */
  hasMap: boolean;
}

/** Лента для работы с трассами. */
export const TraceRibbon = (props: TracePanelProps) => {
  const { t } = useTranslation();
  const traceManager = useTraceManager();

  return (
    <div className={'menu'}>
      <TraceManageSection manager={traceManager} t={t} hasMap={props.hasMap}/>
      <TraceEditSection manager={traceManager} t={t}/>
    </div>
  );
};
