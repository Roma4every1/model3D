import { useDispatch, useSelector } from 'react-redux';
import { MenuSkeleton, MenuSection, BigButtonToggle } from 'shared/ui';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { formSettingsSelector, setSettingsField } from 'widgets/form';
import chartTooltipIcon from 'assets/images/chart/tooltip.png';


const dateStepData = [
  {id: 'month', text: 'Месяц'},
  {id: 'year', text: 'Год'},
];

export const ChartEditPanel = ({id}: FormEditPanelProps) => {
  const dispatch = useDispatch();
  const settings: ChartFormSettings = useSelector(formSettingsSelector.bind(id));

  if (!settings) return <MenuSkeleton template={['80px']}/>;

  const toggleTooltipVisible = () => {
    dispatch(setSettingsField(id, 'tooltip', !settings.tooltip))
  };
  const toggleDateStep = (event: DropDownListChangeEvent) => {
    dispatch(setSettingsField(id, 'dateStep', event.value.id));
  };

  return (
    <div className={'menu'}>
      <MenuSection header={'Подсказка'}>
        <BigButtonToggle
          text={'Показывать значения'} icon={chartTooltipIcon}
          action={toggleTooltipVisible} active={settings.tooltip}
        />
      </MenuSection>
      <MenuSection header={'Интервал'} style={{minWidth: 100}}>
        <DropDownList
          data={dateStepData} dataItemKey={'id'} textField={'text'}
          value={dateStepData[settings.dateStep === 'month' ? 0 : 1]}
          onChange={toggleDateStep}
        />
      </MenuSection>
    </div>
  );
};
