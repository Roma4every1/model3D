import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { MenuSkeleton, MenuSection, BigButtonToggle, BigButton } from 'shared/ui';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { formSettingsSelector, setSettingsField } from 'widgets/presentation';
import chartTooltipIcon from 'assets/images/chart/tooltip.png';
import chartDownloadIcon from 'assets/images/chart/download-png.png'


const dateStepData = [
  {id: 'month', text: 'Месяц'},
  {id: 'year', text: 'Год'},
];

export const ChartEditPanel = ({id}: FormEditPanelProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const settings: ChartFormSettings = useSelector(formSettingsSelector.bind(id));
  if (!settings) return <MenuSkeleton template={['107px', '95px', '100px']}/>;

  const toggleTooltipVisible = () => {
    dispatch(setSettingsField(id, 'tooltip', !settings.tooltip))
  };
  const toggleDateStep = (event: DropDownListChangeEvent) => {
    dispatch(setSettingsField(id, 'dateStep', event.value.id));
  };

  return (
    <div className={'menu'}>
      <MenuSection header={t('chart.panel.tooltip-header')} className={'map-actions'}>
        <BigButtonToggle
          text={t('chart.panel.tooltip-label')} icon={chartTooltipIcon}
          action={toggleTooltipVisible} active={settings.tooltip}
        />
      </MenuSection>
      <MenuSection header={t('chart.panel.export-header')} className={'map-actions'}>
        <BigButton
          text={t('chart.panel.export-png')} icon={chartDownloadIcon}
          action={settings.downloadChart}
        />
      </MenuSection>
      <MenuSection header={t('chart.panel.interval-header')} style={{minWidth: 100}}>
        <DropDownList
          data={dateStepData} dataItemKey={'id'} textField={'text'}
          value={dateStepData[settings.dateStep === 'month' ? 0 : 1]}
          onChange={toggleDateStep}
        />
      </MenuSection>
    </div>
  );
};
