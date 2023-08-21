import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MenuSection, BigButton } from 'shared/ui';
import { showWindow, closeWindow } from 'entities/window';

import { WindowProps } from '@progress/kendo-react-dialogs';
import { CurveSelectionWindow } from './curve-selection-window';
import { ZonesEditingWindow } from './zones-editing-window';

import curvesIcon from 'assets/images/carat/curves.svg';
import curveZonesIcon from 'assets/images/carat/curve-zones.svg';


interface CaratCurvesPanelProps {
  id: FormID;
  stage: ICaratStage;
  curveGroup: ICaratColumnGroup;
}


export const CaratCurvesPanel = ({id, stage, curveGroup}: CaratCurvesPanelProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openCurveSelectionWindow = () => {
    const windowID = 'curve-selection';
    const onClose = () => dispatch(closeWindow(windowID));
    const content = <CurveSelectionWindow id={id} onClose={onClose}/>;

    const windowProps: WindowProps = {
      title: 'Выбор каротажных кривых', maximizeButton: () => null,
      width: 720, height: 480, resizable: false, style: {zIndex: 99}, onClose,
    };
    dispatch(showWindow(windowID, windowProps, content));
  };

  const openZonesEditingWindow = () => {
    const windowID = 'curve-zones';
    const onClose = () => dispatch(closeWindow(windowID));
    const content = <ZonesEditingWindow stage={stage} onClose={onClose}/>;

    const windowProps: WindowProps = {
      title: t('carat.zones.window-title'), maximizeButton: () => null,
      width: 720, height: 480, resizable: false, style: {zIndex: 99}, onClose,
    };
    dispatch(showWindow(windowID, windowProps, content));
  };

  return (
    <MenuSection header={'Управление кривыми'} className={'big-buttons'}>
      <BigButton
        text={'Выбор кривых'} icon={curvesIcon}
        action={openCurveSelectionWindow} disabled={!curveGroup}
      />
      <BigButton
        text={'Зоны кривых'} icon={curveZonesIcon}
        action={openZonesEditingWindow}
      />
    </MenuSection>
  );
};
