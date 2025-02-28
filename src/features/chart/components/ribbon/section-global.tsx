import type { TFunction } from 'react-i18next';
import type { ChartProperty, ChartState } from '../../lib/chart.types';
import { Popover, Checkbox } from 'antd';
import { MenuSection, BigButtonToggle, BigButton } from 'shared/ui';
import { updateChartState } from '../../store/chart.actions';
import tooltipIcon from 'assets/chart/tooltip.png';
import visibilityIcon from 'assets/table/column-visibility.svg';


interface ChartSectionGlobalProps {
  state: ChartState;
  t: TFunction;
}

export const ChartSectionGlobal = ({state, t}: ChartSectionGlobalProps) => {
  const globalSettings = state.global;
  const showTooltip = globalSettings.showTooltip;

  const toggleTooltipVisible = () => {
    globalSettings.showTooltip = !showTooltip;
    updateChartState(state.id);
  };
  const style = {width: 85};

  return (
    <MenuSection header={t('chart.panel.section-global')} className={'big-buttons'}>
      <BigButtonToggle
        text={t('chart.panel.tooltip')} icon={tooltipIcon} style={style}
        onClick={toggleTooltipVisible} active={showTooltip}
      />
      <Popover
        content={<ChartVisibilitySettings state={state}/>} trigger={'click'}
        placement={'bottom'} arrow={false} overlayClassName={'chart-popover'}
      >
        <BigButton text={t('chart.panel.visibility')} icon={visibilityIcon} style={style}/>
      </Popover>
    </MenuSection>
  );
};

const ChartVisibilitySettings = ({state}: {state: ChartState}) => {
  const toListItem = (property: ChartProperty) => {
    const toggleVisibility = () => {
      state.stage.setPropertyVisibility(property.id, !property.visible);
      updateChartState(state.id);
    };
    return (
      <li key={property.id}>
        <Checkbox checked={property.visible} onChange={toggleVisibility}/>
        <span>{property.displayName}</span>
      </li>
    );
  };
  return <ul className={'chart-visibility-list'}>{state.stage.properties.map(toListItem)}</ul>;
};
