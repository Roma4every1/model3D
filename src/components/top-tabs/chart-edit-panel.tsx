import { useDispatch, useSelector } from 'react-redux';
import { MenuSkeleton, MenuSection, BigButtonToggle } from '../common/menu-ui';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { actions, selectors } from '../../store';
import { chartTooltipIcon } from '../../dicts/images';


const dateStepData = [
  {id: 'month', text: 'Месяц'},
  {id: 'year', text: 'Год'},
];

export const ChartEditPanel = ({formID}: PropsFormID) => {
  const dispatch = useDispatch();
  const settings: ChartFormSettings = useSelector(selectors.formSettings.bind(formID));

  if (!settings) return <MenuSkeleton template={['80px']}/>;

  const toggleTooltipVisible = () => {
    dispatch(actions.setSettingsField(formID, 'tooltip', !settings.tooltip))
  };
  const toggleDateStep = (event: DropDownListChangeEvent) => {
    dispatch(actions.setSettingsField(formID, 'dateStep', event.value.id));
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
