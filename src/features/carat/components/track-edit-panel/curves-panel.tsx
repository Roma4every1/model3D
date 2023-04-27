import { useDispatch } from 'react-redux';
import { MenuSection, BigButton } from 'shared/ui';
import { CurveSelectionWindow } from './curve-selection-window';
import { setOpenedWindow } from 'entities/windows';

import curvesIcon from 'assets/images/carat/curves.svg';
import curveZonesIcon from 'assets/images/carat/curve-zones.svg';


interface CaratCurvesPanelProps {
  activeGroup: ICaratColumnGroup,
}


export const CaratCurvesPanel = ({activeGroup}: CaratCurvesPanelProps) => {
  const dispatch = useDispatch();

  const openCurveSelectionWindow = () => {
    const window = <CurveSelectionWindow key={'curve-selection'} activeGroup={activeGroup}/>;
    dispatch(setOpenedWindow('curve-selection', true, window));
  };

  return (
    <MenuSection header={'Управление кривыми'} className={'map-actions'}>
      <BigButton text={'Выбор кривых'} icon={curvesIcon} action={openCurveSelectionWindow}/>
      <BigButton text={'Зоны кривых'} icon={curveZonesIcon} action={() => {}}/>
    </MenuSection>
  );
};
