import type { ChangeEvent } from 'react';
import type { TFunction } from 'react-i18next';
import type { ChartState, ChartAxis } from '../../lib/chart.types';
import { Input, InputNumber, ColorPicker } from 'antd';
import { MenuSection, IconRow, IconRowButton } from 'shared/ui';
import { inputIntParser, inputNumberParser } from 'shared/locales';
import { updateChartState } from '../../store/chart.actions';

import axisLocationRightIcon from 'assets/chart/axis-location-right.svg';
import axisInverseIcon from 'assets/chart/axis-inverse.svg';
import axisScaleLogIcon from 'assets/chart/axis-scale-log.svg';


interface ChartSectionAxisProps {
  state: ChartState;
  t: TFunction;
}
interface AxisFieldsetProps {
  id: FormID;
  axis: ChartAxis;
  t: TFunction;
}

export const ChartSectionAxis = ({state, t}: ChartSectionAxisProps) => {
  const formID = state.id;
  const axis = state.stage.getActiveAxis();

  const header = t('chart.panel.section-axis');
  const className = 'chart-section-axis';
  if (!axis) return <MenuSection header={header} className={className}/>;

  return (
    <MenuSection header={header} className={className}>
      <AxisDomainSettings id={formID} axis={axis} t={t}/>
      <AxisMetaSettings id={formID} axis={axis} t={t}/>
      <AxisViewSettings id={formID} axis={axis} t={t}/>
    </MenuSection>
  );
};

const AxisDomainSettings = (props: AxisFieldsetProps) => {
  const { axis, t } = props;
  const { min, max } = axis;

  const onMinChange = (value: number | null) => {
    axis.min = value;
    updateChartState(props.id);
  };
  const onMaxChange = (value: number | null) => {
    axis.max = value;
    updateChartState(props.id);
  };

  return (
    <fieldset className={'chart-axis-domain'}>
      <span>Min:</span>
      <InputNumber
        value={min} max={max} onChange={onMinChange} parser={inputNumberParser}
        placeholder={t('base.auto')} controls={false} changeOnWheel={true}
      />
      <span>Max:</span>
      <InputNumber
        value={max} min={min} onChange={onMaxChange} parser={inputNumberParser}
        placeholder={t('base.auto')} controls={false} changeOnWheel={true}
      />
    </fieldset>
  );
};

const AxisMetaSettings = ({id, axis, t}: AxisFieldsetProps) => {
  const onTickCountChange = (value: number | null) => {
    axis.tickCount = value;
    updateChartState(id);
  };
  const onDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    axis.displayName = e.target.value;
    updateChartState(id);
  };

  return (
    <fieldset className={'chart-axis-meta'}>
      <span>{t('chart.panel.axis-display-name')}:</span>
      <Input value={axis.displayName} onChange={onDisplayNameChange}/>
      <span>{t('chart.panel.axis-tick-count')}:</span>
      <InputNumber
        value={axis.tickCount} min={1} onChange={onTickCountChange}
        placeholder={t('base.auto')} parser={inputIntParser} controls={false}
      />
    </fieldset>
  );
};

const AxisViewSettings = ({id, axis, t}: AxisFieldsetProps) => {
  const toggleLogScale = () => {
    axis.scale = axis.scale === 'log' ? 'linear' : 'log';
    updateChartState(id);
  };
  const toggleLocation = () => {
    axis.location = axis.location === 'left' ? 'right' : 'left';
    updateChartState(id);
  };
  const toggleInverse = () => {
    axis.inverse = !axis.inverse;
    updateChartState(id);
  };

  return (
    <fieldset className={'chart-axis-view'}>
      <AxisColorPicker id={id} axis={axis} t={t}/>
      <IconRow>
        <IconRowButton
          icon={axisLocationRightIcon} title={t('chart.panel.axis-location-right')}
          active={axis.location === 'right'} onClick={toggleLocation}
        />
        <IconRowButton
          icon={axisInverseIcon} title={t('chart.panel.axis-inverse')}
          active={axis.inverse} onClick={toggleInverse}
        />
        <IconRowButton
          icon={axisScaleLogIcon} title={t('chart.panel.axis-log-scale')}
          active={axis.scale === 'log'} onClick={toggleLogScale}
        />
      </IconRow>
    </fieldset>
  );
};

const AxisColorPicker = ({id, axis, t}: AxisFieldsetProps) => {
  const onColorChange = (_: any, hex: ColorString) => {
    axis.color = hex;
    updateChartState(id);
  };

  return (
    <div className={'chart-color-picker'}>
      <span>{t('chart.panel.axis-color')}:</span>
      <ColorPicker value={axis.color} onChange={onColorChange} disabledAlpha={true}/>
    </div>
  );
};
