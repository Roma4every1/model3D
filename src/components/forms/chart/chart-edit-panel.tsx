import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions, selectors } from "../../../store";
import { chartIconsDict } from "../../../dicts/images";


export default function ChartEditPanel({formId: formID}) {
  const dispatch = useDispatch();
  const chartState: ChartState = useSelector(selectors.chartState.bind(formID));

  const toggleTooltipVisible = useCallback(() => {
    dispatch(actions.setChartTooltipVisible(formID, !chartState.tooltip))
  }, [chartState, formID, dispatch]);

  const className = 'map-action' + (chartState?.tooltip ? ' selected' : '');
  return (
    <div className={'menu'}>
      <section>
        <div className={'menu-header'}>Настройки</div>
        <div className={'map-panel-main'}>
          <button className={className} onClick={toggleTooltipVisible}>
            <div><img src={chartIconsDict['tooltip']} alt={'tooltip'}/></div>
            <div>Показывать значения</div>
          </button>
        </div>
      </section>
    </div>
  );
}
