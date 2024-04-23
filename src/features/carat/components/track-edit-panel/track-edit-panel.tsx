import { useState } from 'react';
import { MenuSkeleton } from 'shared/ui';
import { useCaratState } from '../../store/carat.store';

import './track-edit-panel.scss';
import { CaratNavigationPanel } from './navigation-panel';
import { CaratColumnPanel } from './column-panel';
import { CaratActiveGroupPanel } from './active-group-panel';
import { CaratCurvesPanel } from './curves-panel';
import { CaratExportPanel } from './carat-export';


/** Панель редактирования трека каротажной диаграммы. */
export const TrackEditPanel = ({id}: FormEditPanelProps) => {
  const [_signal, setSignal] = useState(false);
  const signal = () => setSignal(!_signal);

  const state = useCaratState(id);
  if (!state || state.loading.percentage < 100) {
    return <MenuSkeleton template={['291px', '335px', '309px', '161px', '92px']}/>;
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
      <CaratExportPanel stage={stage}/>
    </div>
  );
};
