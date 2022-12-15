import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MenuSkeleton, MenuSection, BigButtonToggle } from "../common/menu-ui";
import { actions, selectors } from "../../store";
import { chartTooltipIcon } from "../../dicts/images";


export function ChartEditPanel({formID}: PropsFormID) {
  const dispatch = useDispatch();
  const chartState: ChartState = useSelector(selectors.chartState.bind(formID));

  const toggleTooltipVisible = useCallback(() => {
    dispatch(actions.setChartTooltipVisible(formID, !chartState.tooltip))
  }, [chartState, formID, dispatch]);

  if (!chartState) return <MenuSkeleton template={['80px']}/>;

  return (
    <div className={'menu'}>
      <MenuSection header={'Настройки'}>
        <BigButtonToggle
          text={'Показывать значения'} icon={chartTooltipIcon}
          action={toggleTooltipVisible} active={chartState.tooltip}
        />
      </MenuSection>
    </div>
  );
}
