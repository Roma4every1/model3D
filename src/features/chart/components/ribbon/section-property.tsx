import type { TFunction } from 'react-i18next';
import type { ChartState, ChartProperty, ChartPreset } from '../../lib/chart.types';
import { clsx } from 'clsx';
import { ColorPicker, Popover } from 'antd';
import { MenuSection, IconRow, IconRowButton } from 'shared/ui';
import { updateChartState } from '../../store/chart.actions';
import { chartPresets } from '../../lib/constants';
import labelVisibilityIcon from 'assets/chart/label-visibility.svg';
import pointVisibilityIcon from 'assets/chart/point-visibility.svg';


interface ChartSectionPropertyProps {
  state: ChartState;
  t: TFunction;
}
interface ChartPropertyProps {
  state: ChartState;
  property: ChartProperty;
  t: TFunction;
}
interface PresetSelectProps {
  state: ChartState;
  activeProperty: ChartProperty;
  activePreset: ChartPreset;
  t: TFunction;
}
interface PresetButtonProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}


export const ChartSectionProperty = ({state, t}: ChartSectionPropertyProps) => {
  const stage = state.stage;
  const property = stage.getActiveProperty();

  return (
    <MenuSection header={t('chart.panel.section-property')} className={'chart-section-property'}>
      <PresetSelectButton state={state} property={property} t={t}/>
      <div>
        <PropertyColorPicker state={state} property={property} t={t}/>
        <PropertyFlags state={state} property={property} t={t}/>
      </div>
    </MenuSection>
  );
};

const PropertyColorPicker = ({state, property, t}: ChartPropertyProps) => {
  const onChange = (_: any, hex: ColorString) => {
    property.color = hex;
    state.stage.updatePropertyLegend(property);
    updateChartState(state.id);
  };

  return (
    <div className={'chart-color-picker'}>
      <span>{t('chart.panel.property-color')}:</span>
      <ColorPicker value={property.color} onChange={onChange} disabledAlpha={true}/>
    </div>
  );
};

const PropertyFlags = ({state, property, t}: ChartPropertyProps) => {
  const type = property.displayType;
  const pointDisable = type !== 'line' && type !== 'area';

  const toggleLabelVisibility = () => {
    property.showLabels = !property.showLabels;
    updateChartState(state.id);
  };
  const togglePointVisibility = () => {
    property.showPoints = !property.showPoints;
    state.stage.updatePropertyLegend(property);
    updateChartState(state.id);
  };

  return (
    <IconRow>
      <IconRowButton
        icon={labelVisibilityIcon} title={t('chart.panel.show-labels')}
        active={property.showLabels} onClick={toggleLabelVisibility}
      />
      <IconRowButton
        icon={pointVisibilityIcon} title={t('chart.panel.show-points')}
        active={property.showPoints} onClick={togglePointVisibility} disabled={pointDisable}
      />
    </IconRow>
  );
};

const PresetSelectButton = ({state, property, t}: ChartPropertyProps) => {
  const preset = property && chartPresets.find((p: ChartPreset) => {
    if (p.displayType !== property.displayType) return false;
    return !p.curveType || p.curveType === property.curveType;
  });
  const content = (
    <PresetSelect state={state} activeProperty={property} activePreset={preset} t={t}/>
  );

  return (
    <Popover
      content={content} trigger={'click'}
      placement={'bottom'} arrow={false} overlayClassName={'chart-popover chart-preset-popover'}
    >
      <PresetButton icon={preset.icon} label={t(preset.label)}/>
    </Popover>
  );
};

const PresetSelect = ({state, activeProperty, activePreset, t}: PresetSelectProps) => {
  const toElement = (preset: ChartPreset, i: number) => {
    const { label, icon } = preset;
    const active = preset === activePreset;

    const onClick = active ? undefined : () => {
      state.stage.setPropertyPreset(activeProperty.id, preset);
      updateChartState(state.id);
    };
    return <PresetButton key={i} label={t(label)} icon={icon} active={active} onClick={onClick}/>;
  };
  return <div className={'chart-preset-select'}>{chartPresets.map(toElement)}</div>;
};

const PresetButton = ({icon, label, active, onClick}: PresetButtonProps) => {
  return (
    <button className={clsx('chart-preset', active && 'active')} onClick={onClick}>
      <img src={icon} alt={label}/>
      <span>{label}</span>
    </button>
  );
};
