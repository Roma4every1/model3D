import { useTranslation } from 'react-i18next';
import { MenuSkeleton, MenuSection, BigButtonToggle, BigButton } from 'shared/ui';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { useChartState } from '../store/chart.store';
import { setChartDateStep, setChartTooltipVisibility } from '../store/chart.actions';
import chartTooltipIcon from 'assets/chart/tooltip.png';
import chartDownloadIcon from 'assets/chart/download-png.png';


const dateStepData = [
  {id: 'month', text: 'Месяц'},
  {id: 'year', text: 'Год'},
];

export const ChartEditPanel = ({id}: FormEditPanelProps) => {
  const { t } = useTranslation();
  const state: ChartState = useChartState(id);
  if (!state) return <MenuSkeleton template={['107px', '95px', '100px']}/>;

  const toggleTooltipVisible = () => {
    setChartTooltipVisibility(id, !state.tooltip);
  };
  const toggleDateStep = (event: DropDownListChangeEvent) => {
    setChartDateStep(id, event.value.id);
  };

  return (
    <div className={'menu'}>
      <MenuSection header={t('chart.panel.tooltip-header')} className={'map-actions'}>
        <BigButtonToggle
          text={t('chart.panel.tooltip-label')} icon={chartTooltipIcon}
          onClick={toggleTooltipVisible} active={state.tooltip}
        />
      </MenuSection>
      <MenuSection header={t('chart.panel.export-header')} className={'map-actions'}>
        <BigButton
          text={t('chart.panel.export-png')} icon={chartDownloadIcon}
          onClick={state.downloadChart}
        />
      </MenuSection>
      <MenuSection header={t('chart.panel.interval-header')} style={{minWidth: 100}}>
        <DropDownList
          data={dateStepData} dataItemKey={'id'} textField={'text'}
          value={dateStepData[state.dateStep === 'month' ? 0 : 1]}
          onChange={toggleDateStep}
        />
      </MenuSection>
    </div>
  );
};
