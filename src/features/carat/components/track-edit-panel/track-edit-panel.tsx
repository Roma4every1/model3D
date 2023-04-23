import { useSelector } from 'react-redux';
import { MenuSkeleton } from 'shared/ui';
import { caratStateSelector } from '../../store/carats.selectors';

import './track-edit-panel.scss';
import { CaratScalePanel } from './scale-panel';
import { CaratColumnsPanel } from './columns-panel';
import { CaratActiveGroupPanel } from './active-column-panel';


export const TracksEditPanel = ({id}: FormEditPanelProps) => {
  const state: CaratState = useSelector(caratStateSelector.bind(id));
  if (!state) return <MenuSkeleton template={['100px', '100px', '100px']}/>;

  const stage = state.stage;
  const track = stage.getActiveTrack();

  return (
    <div className={'menu'}>
      <CaratScalePanel stage={stage} track={track}/>
      <CaratColumnsPanel id={id} stage={stage} track={track}/>
      <CaratActiveGroupPanel stage={stage} column={state.activeGroup}/>
    </div>
  );
};
