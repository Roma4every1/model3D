import type { XRawElement } from 'shared/lib';
import type { ChartState, ChartProperty, ChartAxis } from './chart.types';
import type { ChartSettingsDTO, ChartPropertyDTO, ChartAxisDTO } from './chart.dto.types';
import { rgb } from 'd3-color';


export function chartStateToExtra(state: ChartState): XRawElement {
  return {attrs: {tooltip: String(state.global.showTooltip)}};
}

export function chartStateToSettings(state: ChartState): ChartSettingsDTO {
  const { axes, properties, dataController } = state.stage;
  const seriesSettings: ChartSettingsDTO['seriesSettings'] = {};

  const xAxisType = serializeXAxisType(dataController.xType);
  const dateStep = serializeDateStep(dataController.dateStep);

  for (const property of properties) {
    let dto = seriesSettings[property.channel.name];
    if (!dto) {
      const xAxisFieldName = property.xProperty.name;
      dto = {xAxisType, xAxisFieldName, dateStep, seriesSettings: {}, axesSettings: {}};
      seriesSettings[property.channel.name] = dto;
    }
    const yAxisID = property.yAxisID;
    if (!dto.axesSettings[yAxisID]) {
      const axis = axes.find(a => a.id === yAxisID);
      dto.axesSettings[yAxisID] = serializeAxis(axis);
    }
    dto.seriesSettings[property.yProperty.name] = serializeProperty(property);
  }
  return {seriesSettings};
}

function serializeProperty(property: ChartProperty): ChartPropertyDTO {
  return {
    yAxisId: property.yAxisID, legendName: property.displayName,
    typeCode: serializeTypeCode(property.displayType, property.curveType),
    color: serializeColor(property.color),
    showLine: property.showLine, showPoint: property.showPoints, showLabels: property.showLabels,
    pointFigureIndex: property.dotOptions?.shape?.toString(), zIndex: property.zIndex,
    lineStyleIndex: property.lineStyleIndex, sizeMultiplier: property.sizeMultiplier,
  };
}

function serializeAxis(axis: ChartAxis): ChartAxisDTO {
  return {
    min: axis.min, max: axis.max, tickCount: axis.tickCount,
    scale: axis.scale, location: axis.location === 'left' ? 'Left' : 'Right',
    color: serializeColor(axis.color), displayName: axis.displayName,
    inverse: axis.inverse, half: axis.half,
  };
}

function serializeXAxisType(type: ChartXAxisType): string {
  if (type === 'date') return 'Dates';
  if (type === 'category') return 'Categories';
  return undefined;
}
function serializeDateStep(step: ChartDateStep): string {
  if (step === 'month') return 'Month';
  if (step === 'year') return 'Year';
  if (step === 'day') return 'Day';
  return undefined;
}

function serializeTypeCode(displayType: ChartDisplayType, curveType: ChartCurveType): string {
  if (displayType === 'line') {
    if (curveType === 'natural') return 'graphSpline';
    if (curveType === 'stepAfter') return 'graphDiscr';
    return 'graph';
  }
  if (displayType === 'area') {
    if (curveType === 'natural') return 'areaSpline';
    if (curveType === 'stepAfter') return 'areaDiscr';
    return 'area';
  }
  return displayType === 'bar' ? 'gist' : displayType;
}
function serializeColor(color: ColorString): string {
  const { r, g, b, opacity } = rgb(color);
  return `rgba(${r},${g},${b},${opacity})`;
}
