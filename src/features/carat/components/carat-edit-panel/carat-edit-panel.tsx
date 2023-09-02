import { useState } from 'react';
import { useSelector } from 'react-redux';
import { caratStateSelector } from '../../store/carat.selectors';
import { MenuSkeleton } from 'shared/ui';
import { LocalizationProvider, IntlProvider } from '@progress/kendo-react-intl';

import './carat-edit-panel.scss';
import { XAxisSection } from './x-axis-section';
import { CurveTypesSection } from './curve-types-section';


/** Панель редактирования каротажа. */
export const CaratEditPanel = ({id}: FormEditPanelProps) => {
  const [_signal, setSignal] = useState(false);
  const signal = () => setSignal(!_signal);

  const state: CaratState = useSelector(caratStateSelector.bind(id));
  if (!state || state.loading.percentage < 100) {
    return <MenuSkeleton template={['205px', '458px', '301px']}/>;
  }

  const stage = state.stage;
  stage.listeners.caratPanelChange = signal;

  const track = stage.getActiveTrack();
  const curveGroup = track.getCurveGroup();
  const activeCurve = track.getActiveCurve();

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <div className={'menu'}>
          <XAxisSection stage={stage} group={curveGroup}/>
          <CurveTypesSection stage={stage} group={curveGroup} curve={activeCurve}/>
        </div>
      </IntlProvider>
    </LocalizationProvider>
  );
};
