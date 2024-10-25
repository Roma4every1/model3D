import { useState, ChangeEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuSkeleton, MenuSection, BigButtonToggle, BigButton } from 'shared/ui';
import { useChartState } from '../store/chart.store';
import { setAxisSettings, setChartDateStep, setChartSeriesSettings, setChartTooltipVisibility, setElementVisible } from '../store/chart.actions';
import { Button, ColorPicker, Dropdown, Input, InputNumber, Popover, Select } from 'antd';
import { Color } from 'antd/es/color-picker';
import { useRender } from 'shared/react';
import { getAxisSettings, getParameterSettings } from '../lib/utils';

import chartTooltipIcon from 'assets/chart/tooltip.png';
import chartDownloadIcon from 'assets/chart/download-png.png';
import tooltipLineIcon from 'assets/chart/tooltipLineIcon.svg';
import visibilityIcon from 'assets/table/column-visibility.svg';
import { AreaDiscrIcon, AreaIcon, AreaSplineIcon, DefaultIcon, GistIcon, GraphDiscrIcon, GraphIcon, GraphSplineIcon, PointIcon, VerticalLineIcon } from './icons';
import './chart-edit-panel.scss';


const dateStepData = [
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
];

const items = [
  { key: 'gist', label: 'Гистограмма', icon: <GistIcon /> },
  { key: 'area', label: 'Область', icon: <AreaIcon /> },
  { key: 'areaSpline', label: 'Область сплайн', icon: <AreaSplineIcon /> },
  { key: 'areaDiscr', label: 'Область дискретная', icon: <AreaDiscrIcon /> },
  { key: 'point', label: 'Точечная', icon: <PointIcon /> },
  { key: 'graph', label: 'Линия', icon: <GraphIcon /> },
  { key: 'graphSpline', label: 'Линия сплайн', icon: <GraphSplineIcon /> },
  { key: 'graphDiscr', label: 'Линия дискретная', icon: <GraphDiscrIcon /> },
  { key: 'verticalLine', label: 'Вертикальная линия', icon: <VerticalLineIcon /> },
];

const positionData = [
  { value: 'Left', label: 'Слева' },
  { value: 'Right', label: 'Справа' },
];

const inverseData = [
  { value: false, label: 'Снизу вверх' },
  { value: true, label: 'Сверху вниз' }
]

const scaleData = [
  { value: 'linear', label: 'Линейная' },
  { value: 'log', label: 'Логарифмическая' },
]

export const ChartEditPanel = ({ id }: FormEditPanelProps) => {
  const { t } = useTranslation();
  const state: ChartState = useChartState(id);
  const { seriesSettings, selectedSeries } = state;

  const foundSettings = getParameterSettings(id, selectedSeries);

  const findXAxisType = () => {
    let xAxisType = null;
    for (const channel in seriesSettings) {
      if (seriesSettings[channel]?.xAxisType) {
        xAxisType = seriesSettings[channel].xAxisType;
        break;
      }
    }
    return xAxisType;
  };
  const xAxisType = findXAxisType();

  if (!state) return <MenuSkeleton template={['107px', '95px', '100px']} />;

  const toggleTooltipVisible = () => {
    setChartTooltipVisibility(id, !state.tooltip);
  };

  const toggleDateStep = (value: ChartDateStep) => {
    setChartDateStep(id, value);
  };

  return (
    <div className={'menu'}>
      <MenuSection header={'Общие'} className={'map-actions'}>
        <BigButtonToggle
          text={t('chart.panel.tooltip-label')} icon={chartTooltipIcon}
          onClick={toggleTooltipVisible} active={state.tooltip}
        />
        <Popover
          content={<ElementsVisibilityTree id={id} state={state} />} trigger={'click'}
          placement={'bottom'} arrow={false} overlayClassName={'visibility-popover'}>
          <BigButtonToggle text={'Видимость элементов'} icon={visibilityIcon} />
        </Popover>
        <div className={'map-action'} >
          <span>Интервал:</span>
          <Select style={{ minWidth: 70 }} title='Интервал'
            defaultValue={dateStepData.find(item => item.value === state.dateStep).value}
            options={dateStepData} onChange={toggleDateStep} disabled={xAxisType === 'Categories'}
          />
        </div>
      </MenuSection>

      {selectedSeries &&
        <ActiveElementSettings id={id} selectedSeries={selectedSeries} foundSettings={foundSettings} />
      }
      <AxisSettings id={id} />
      <MenuSection header={t('chart.panel.export-header')} className={'map-actions'}>
        <BigButton
          text={t('chart.panel.export-png')} icon={chartDownloadIcon}
          onClick={state.downloadChart}
        />
      </MenuSection>
    </div >
  );
};

interface ElementsVisibilityTreeProps {
  id: FormID,
  state: ChartState,
}

const ElementsVisibilityTree = ({ id, state }: ElementsVisibilityTreeProps) => {
  const tree = state.properties
  console.log(state);
  const handleCheckboxChange = (propertyName: PropertyName, channelName: ChannelName, isVisible: boolean) => {
    setElementVisible(id, propertyName, channelName, isVisible);
  };

  return (
    <div className={'visibility-list'}>
      {tree.map(property => (
        <div key={property.id}>
          <label className={'visibility-label'}>
            <input type="checkbox" checked={property.visible}
              onChange={(e) => handleCheckboxChange(property.propertyName, property.channelName, e.target.checked)}
            />
            {property.title}
          </label>
        </div>
      ))}
    </div>
  );
};

interface ActiveElementSettingsProps {
  id: FormID,
  selectedSeries: string,
  foundSettings: SeriesSettingsItem,
};

const ActiveElementSettings = ({ id, selectedSeries, foundSettings }: ActiveElementSettingsProps) => {
  const matchingDiagram = items.find(type => type.key === foundSettings?.typeCode);
  const selectedDiagramType = matchingDiagram ? matchingDiagram.label : 'Тип не выбран';
  const selectedIcon = matchingDiagram ? matchingDiagram.icon : <DefaultIcon />;

  const handleGraph = (value) => {
    setChartSeriesSettings(id, selectedSeries, { typeCode: value.key });
  };

  const handleColorChange = (value: Color) => {
    const rgbaColor = value.toRgbString().replace(')', ', 1)');
    setChartSeriesSettings(id, selectedSeries, { color: rgbaColor });
  };

  const toggleShowLabels = () => {
    setChartSeriesSettings(id, selectedSeries, { showLabels: !foundSettings.showLabels });
  }
  const menuProps = {
    items,
    onClick: handleGraph,
  };

  return (
    <MenuSection header={'Настройки активного элемента'} style={{ flexDirection: 'row' }}>
      <Dropdown menu={menuProps} trigger={['click']}
        disabled={!matchingDiagram} overlayClassName={'type-list'}>
        <Button className={'map-action type-btn'} title={selectedDiagramType}
          icon={selectedIcon} disabled={!foundSettings}>
          {selectedDiagramType}
        </Button>
      </Dropdown>
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <ColorPicker
          defaultFormat='rgb' disabled={!foundSettings}
          value={foundSettings ? foundSettings.color : '#888'}
          onChange={handleColorChange}
        />
        <label style={{ fontSize: '1rem' }}>Цвет</label>
      </div>
      <BigButtonToggle
        className={'type-btn'} text={'Показать подпись'}
        icon={tooltipLineIcon}
        onClick={toggleShowLabels}
        active={foundSettings ? foundSettings.showLabels : false} disabled={!foundSettings}
      />
    </MenuSection>
  );
};

interface AxisIntervalProps {
  id: FormID,
}

const AxisSettings = ({ id }: AxisIntervalProps) => {
  const render = useRender();
  const axisSettings = getAxisSettings(id);

  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);
  const [auto, setAuto] = useState(false);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    const min = axisSettings?.min ?? null;
    const max = axisSettings?.max ?? null;
    setMin(min); setMax(max);
    setValid(min === null || max === null || min < max);
    setAuto(axisSettings === undefined);

  }, [axisSettings]);

  const onChangeDisplayName = (event: ChangeEvent<HTMLInputElement>) => {
    const newDisplayName = event.target.value;
    setAxisSettings(id, { displayName: newDisplayName });
  }

  const toggleScaleType = (value: ScaleTypeCode) => {
    axisSettings.scale = value;
    render();
    setAxisSettings(id, { scale: value });
  }

  const togglePosition = (value: string) => {
    setAxisSettings(id, { location: value });
  }

  const toggleInverse = (value: boolean) => {
    setAxisSettings(id, { inverse: value });
  }

  const handleTickCountChange = (value: number) => {
    setAxisSettings(id, { tickCount: value });
  }

  const handleMinChange = (value: number | null) => {
    setAxisSettings(id, { min: value });
    if (auto) setAuto(false);
  }
  const handleMaxChange = (value: number | null) => {
    setAxisSettings(id, { max: value });
    if (auto) setAuto(false);
  }


  return (
    <MenuSection header={'Настройка осей'} style={{ flexDirection: 'row' }}>
        <div className={'axis-item'} style={{ minWidth: 180 }} >
          <div>
            <span style={{ whiteSpace: 'nowrap' }}>Ось Y:</span>
            <Input value={axisSettings.displayName} onChange={onChangeDisplayName} />
          </div>
          <div>
            <span style={{ whiteSpace: 'nowrap' }}>Тип шкалы:</span>
            <Select defaultValue={scaleData.find(scale => scale.value === axisSettings.scale)?.value || scaleData[0].value}
              options={scaleData} onChange={toggleScaleType} style={{ width: '100%' }} />
          </div>
        </div>
        <div className={'axis-item'} style={{ minWidth: 180 }}>
          <div>
            <span>Расположение:</span>
            <Select options={positionData} onChange={togglePosition} style={{ width: '100%' }}
              defaultValue={positionData.find(item => item.value === axisSettings.location).value}
            />
          </div>
          <div>
            <span>Направление:</span>
            <Select options={inverseData} onChange={toggleInverse} style={{ width: '100%' }}
              defaultValue={inverseData.find(item => item.value === axisSettings.inverse).value}
            />
          </div>
        </div>
        <div className={'axis-item'}>
          <div>
            <span>Min:</span>
            <InputNumber style={{ maxWidth: 130 }} type='number'
              status={valid ? '' : 'error'}
              value={min} onChange={handleMinChange}
              changeOnWheel={true}
            />
          </div>
          <div>
            <span>Max:</span>
            <InputNumber style={{ maxWidth: 130 }} type='number'
              status={valid ? '' : 'error'}
              value={max} onChange={handleMaxChange}
              changeOnWheel={true}
            />
          </div>
        </div>
        <div className={'axis-item'}>
          <div>
            <span>Деления:</span>
            <InputNumber style={{ maxWidth: 130 }} min={1} type='number'
              value={axisSettings.tickCount}
              onChange={handleTickCountChange}
              changeOnWheel={true} precision={0} />
          </div>
        </div>
      </MenuSection>
  );
};

