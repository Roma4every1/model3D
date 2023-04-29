import { useSelector } from 'react-redux';
import { MenuSkeleton } from 'shared/ui';
import { caratStateSelector } from '../../store/carats.selectors';

import './track-edit-panel.scss';
import { CaratNavigationPanel } from './navigation-panel';
import { CaratColumnsPanel } from './columns-panel';
import { CaratActiveGroupPanel } from './active-group-panel';
import { CaratCurvesPanel } from './curves-panel';


/** Панель редактирования трека каротажной диаграммы. */
export const TracksEditPanel = ({id}: FormEditPanelProps) => {
  const state: CaratState = useSelector(caratStateSelector.bind(id));
  if (!state) return <MenuSkeleton template={['100px', '100px', '100px', '100px']}/>;

  const { stage, activeGroup } = state;
  const track = stage.getActiveTrack();

  return (
    <div className={'menu'}>
      <CaratNavigationPanel stage={stage} track={track}/>
      <CaratColumnsPanel id={id} stage={stage} track={track}/>
      <CaratActiveGroupPanel stage={stage} track={track} activeGroup={activeGroup}/>
      <CaratCurvesPanel stage={stage} activeGroup={activeGroup}/>
    </div>
  );
};
