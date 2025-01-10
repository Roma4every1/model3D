import { MenuSkeleton } from 'shared/ui';
import { useCaratState } from '../../store/carat.store';

import './track-edit-panel.scss';
import { CaratNavigationSection } from './section-navigation';
import { CaratActiveGroupSection } from './section-group';
import { CaratCurveSection } from './section-curves';
import { CaratExportSection } from './section-export';


/** Панель редактирования трека каротажной диаграммы. */
export const TrackEditPanel = ({id}: FormEditPanelProps) => {
  const state = useCaratState(id);
  if (!state || state.loading.percentage < 100) {
    return <MenuSkeleton template={['290px', '310px', '160px', '150px']}/>;
  }
  const { stage, loader } = state;

  return (
    <div className={'menu'}>
      <CaratNavigationSection stage={stage}/>
      <CaratActiveGroupSection stage={stage}/>
      <CaratCurveSection id={id} stage={stage} loader={loader}/>
      <CaratExportSection stage={stage}/>
    </div>
  );
};
