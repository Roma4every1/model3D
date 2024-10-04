import { MenuSkeleton } from 'shared/ui';
import { useCaratState } from '../../store/carat.store';

import './track-edit-panel.scss';
import { CaratNavigationSection } from './navigation';
import { CaratActiveGroupSection } from './active-group';
import { CaratCurveSection } from './curves';
import { CaratExportSection } from './export';


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
