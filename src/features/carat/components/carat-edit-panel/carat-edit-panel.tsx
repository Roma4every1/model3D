import { useSelector } from 'react-redux';
import { caratStateSelector } from '../../store/carats.selectors';
import { MenuSkeleton } from 'shared/ui';
import { LocalizationProvider, IntlProvider } from '@progress/kendo-react-intl';

import './carat-edit-panel.scss';
import { XAxisSection } from './x-axis-section';
import { CurveTypesSection } from './curve-types-section';


/** Панель редактирования каротажа. */
export const CaratEditPanel = ({id}: FormEditPanelProps) => {
  const state: CaratState = useSelector(caratStateSelector.bind(id));
  if (!state) return <MenuSkeleton template={['100px', '100px', '100px']}/>;

  const stage = state.stage;
  const track = stage.getActiveTrack();
  const activeGroup = track.getActiveGroup();

  const curveGroup = activeGroup?.hasCurveColumn()
    ? activeGroup
    : track.getGroups().find((group) => group.hasCurveColumn());

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <div className={'menu'}>
          <XAxisSection stage={stage} group={curveGroup}/>
          <CurveTypesSection stage={stage} group={curveGroup} curve={state.activeCurve}/>
        </div>
      </IntlProvider>
    </LocalizationProvider>
  );
};
