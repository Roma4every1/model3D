import { useDispatch } from 'react-redux';
import { MenuSection, BigButton } from 'shared/ui';
import { setOpenedWindow } from 'entities/window';

import { CurveSelectionWindow } from './curve-selection-window';
import { ZonesEditingWindow } from './zones-editing-window';

import curvesIcon from 'assets/images/carat/curves.svg';
import curveZonesIcon from 'assets/images/carat/curve-zones.svg';


interface CaratCurvesPanelProps {
  id: FormID,
  stage: ICaratStage,
  curveGroup: ICaratColumnGroup,
}


export const CaratCurvesPanel = ({id, stage, curveGroup}: CaratCurvesPanelProps) => {
  const dispatch = useDispatch();

  const openCurveSelectionWindow = () => {
    const window = <CurveSelectionWindow key={'curve-selection'} id={id}/>;
    dispatch(setOpenedWindow('curve-selection', true, window));
  };

  const openZonesEditingWindow = () => {
    const window = <ZonesEditingWindow key={'curve-zones'} stage={stage}/>;
    dispatch(setOpenedWindow('curve-zones', true, window));
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
