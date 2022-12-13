import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MenuSection } from "../common/menu-ui";
import { actions, selectors } from "../../store";
import { chartIconsDict } from "../../dicts/images";


export function ChartEditPanel({formID}: PropsFormID) {
  const dispatch = useDispatch();
  const chartState: ChartState = useSelector(selectors.chartState.bind(formID));

  const toggleTooltipVisible = useCallback(() => {
    dispatch(actions.setChartTooltipVisible(formID, !chartState.tooltip))
  }, [chartState, formID, dispatch]);

  const className = 'map-action' + (chartState?.tooltip ? ' selected' : '');
  return (
    <div className={'menu'}>
      <MenuSection header={'Настройки'}>
        <button className={className} onClick={toggleTooltipVisible}>
          <div><img src={chartIconsDict['tooltip']} alt={'tooltip'}/></div>
          <div>Показывать значения</div>
        </button>
      </MenuSection>
    </div>
  );
}
