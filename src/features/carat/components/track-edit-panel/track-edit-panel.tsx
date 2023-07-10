import { useSelector } from 'react-redux';
import { MenuSkeleton } from 'shared/ui';
import { caratStateSelector } from '../../store/carat.selectors';

import './track-edit-panel.scss';
import { CaratNavigationPanel } from './navigation-panel';
import { CaratColumnsPanel } from './columns-panel';
import { CaratActiveGroupPanel } from './active-group-panel';
import { CaratCurvesPanel } from './curves-panel';
import {useState} from "react";


/** Панель редактирования трека каротажной диаграммы. */
export const TrackEditPanel = ({id}: FormEditPanelProps) => {
  const [_signal, setSignal] = useState(false);
  const signal = () => setSignal(!_signal);

  const state: CaratState = useSelector(caratStateSelector.bind(id));
  if (!state) return <MenuSkeleton template={['224px', '382px', '309px', '180px']}/>;

  const { stage, activeGroup, curveGroup } = state;
  const track = stage.getActiveTrack();

  return (
    <div className={'menu'}>
      <CaratNavigationPanel stage={stage} track={track}/>
      <CaratColumnsPanel id={id} stage={stage} track={track} signal={signal}/>
      <CaratActiveGroupPanel stage={stage} track={track} activeGroup={activeGroup} signal={signal}/>
      <CaratCurvesPanel id={id} stage={stage} curveGroup={curveGroup}/>
    </div>
  );
};
