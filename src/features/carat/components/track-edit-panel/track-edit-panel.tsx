import { useState } from 'react';
import { useSelector } from 'react-redux';
import { MenuSkeleton } from 'shared/ui';
import { caratStateSelector } from '../../store/carat.selectors';

import './track-edit-panel.scss';
import { CaratNavigationPanel } from './navigation-panel';
import { CaratColumnPanel } from './column-panel.tsx';
import { CaratActiveGroupPanel } from './active-group-panel';
import { CaratCurvesPanel } from './curves-panel';


/** Панель редактирования трека каротажной диаграммы. */
export const TrackEditPanel = ({id}: FormEditPanelProps) => {
  const [_signal, setSignal] = useState(false);
  const signal = () => setSignal(!_signal);

  const state: CaratState = useSelector(caratStateSelector.bind(id));
  if (!state || state.loading.percentage < 100) {
    return <MenuSkeleton template={['291px', '382px', '309px', '180px']}/>;
  }

  const stage = state.stage;
  stage.listeners.trackPanelChange = signal;

  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();
  const curveGroup = track.getCurveGroup();

  return (
    <div className={'menu'}>
      <CaratNavigationPanel stage={stage} track={track}/>
      <CaratColumnPanel stage={stage} track={track}/>
      <CaratActiveGroupPanel stage={stage} track={track} activeGroup={activeGroup}/>
      <CaratCurvesPanel id={id} stage={stage} curveGroup={curveGroup}/>
    </div>
  );
};
