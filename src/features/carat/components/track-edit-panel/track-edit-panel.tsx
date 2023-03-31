import { useSelector } from 'react-redux';
import { MenuSkeleton } from 'shared/ui';
import { caratStateSelector } from '../../store/carats.selectors';

import './track-edit-panel.scss';
import { CaratScalePanel } from './scale-panel';
import { CaratColumnsPanel } from './columns-panel';
import { CaratActiveColumnPanel } from './active-column-panel';


export const TracksEditPanel = ({id}: FormEditPanelProps) => {
  const state: CaratState = useSelector(caratStateSelector.bind(id));
  if (!state) return <MenuSkeleton template={['100px', '100px', '100px']}/>;
  const { model, drawer } = state;

  return (
    <div className={'menu'}>
      <CaratScalePanel model={model} drawer={drawer}/>
      <CaratColumnsPanel id={id} model={model} drawer={drawer}/>
      <CaratActiveColumnPanel column={state.activeColumn} drawer={drawer}/>
    </div>
  );
};
