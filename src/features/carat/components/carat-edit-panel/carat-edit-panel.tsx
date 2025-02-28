import { useCaratState } from '../../store/carat.store';
import { MenuSkeleton } from 'shared/ui';
import { LocalizationProvider, IntlProvider } from '@progress/kendo-react-intl';

import './carat-edit-panel.scss';
import { XAxisSection } from './x-axis';
import { CurveTypesSection } from './curve-types';


/** Панель редактирования каротажа. */
export const CaratEditPanel = ({id}: FormRibbonProps) => {
  const state = useCaratState(id);
  if (!state || state.loading.percentage < 100) {
    return <MenuSkeleton template={['205px', '458px', '301px']}/>;
  }
  const stage = state.stage;

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <div className={'menu'}>
          <XAxisSection stage={stage}/>
          <CurveTypesSection stage={stage}/>
        </div>
      </IntlProvider>
    </LocalizationProvider>
  );
};
