import { useTranslation } from 'react-i18next';
import { useCaratState } from '../../store/carat.store';
import { MenuSkeleton } from 'shared/ui';

import './track-edit-panel.scss';
import { CaratNavigationSection } from './section-navigation';
import { CaratActiveGroupSection } from './section-group';
import { CaratCurveSection } from './section-curves';
import { CaratExportSection } from './section-export';


/** Панель редактирования трека каротажной диаграммы. */
export const TrackEditPanel = ({id}: FormRibbonProps) => {
  const { t } = useTranslation();
  const state = useCaratState(id);

  if (!state || state.loading.percentage < 100) {
    return <MenuSkeleton template={['255px', '370px', '175px', '150px']}/>;
  }
  const { stage, loader } = state;

  return (
    <div className={'menu'}>
      <CaratNavigationSection stage={stage}/>
      <CaratActiveGroupSection stage={stage} t={t}/>
      <CaratCurveSection id={id} stage={stage} loader={loader}/>
      <CaratExportSection stage={stage}/>
    </div>
  );
};
