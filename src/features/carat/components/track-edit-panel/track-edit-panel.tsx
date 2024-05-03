import { MenuSkeleton } from 'shared/ui';
import { useCaratState } from '../../store/carat.store';

import './track-edit-panel.scss';
import { CaratNavigationSection } from './navigation';
import { CaratGroupSection } from './groups';
import { CaratActiveGroupSection } from './active-group';
import { CaratCurveSection } from './curves';
import { CaratExportSection } from '../windows/carat-export';


/** Панель редактирования трека каротажной диаграммы. */
export const TrackEditPanel = ({id}: FormEditPanelProps) => {
  const state = useCaratState(id);
  if (!state || state.loading.percentage < 100) {
    return <MenuSkeleton template={['291px', '335px', '309px', '161px', '92px']}/>;
  }
  const stage = state.stage;

  return (
    <div className={'menu'}>
      <CaratNavigationSection stage={stage}/>
      <CaratGroupSection stage={stage}/>
      <CaratActiveGroupSection stage={stage}/>
      <CaratCurveSection id={id} stage={stage}/>
      <CaratExportSection stage={stage}/>
    </div>
  );
};
