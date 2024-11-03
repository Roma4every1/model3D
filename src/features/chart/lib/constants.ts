import type { ChartPreset } from './chart.types';
import lineLinearIcon from 'assets/chart/display-line-linear.svg';
import lineSmoothIcon from 'assets/chart/display-line-smooth.svg';
import lineStepIcon from 'assets/chart/display-line-step.svg';
import areaLinearIcon from 'assets/chart/display-area-linear.svg';
import areaSmoothIcon from 'assets/chart/display-area-smooth.svg';
import areaStepIcon from 'assets/chart/display-area-step.svg';
import pointIcon from 'assets/chart/display-point.svg';
import barIcon from 'assets/chart/display-bar.svg';
import verticalIcon from 'assets/chart/display-vertical.svg';


/** Доступные штриховки линий на графике. */
export const lineDashArrays: number[][] = [
  undefined,
  [3, 3],
  [1, 1],
  [3, 1, 1, 1],
  [3, 1, 1, 1, 1, 1],
];

/** Типы отображения элементов на графике. */
export const chartPresets: ChartPreset[] = [
  {
    label: 'chart.preset.line-linear', icon: lineLinearIcon,
    displayType: 'line', curveType: 'linear',
  },
  {
    label: 'chart.preset.line-smooth', icon: lineSmoothIcon,
    displayType: 'line', curveType: 'natural',
  },
  {
    label: 'chart.preset.line-step', icon: lineStepIcon,
    displayType: 'line', curveType: 'stepAfter',
  },
  {
    label: 'chart.preset.area-linear', icon: areaLinearIcon,
    displayType: 'area', curveType: 'linear',
  },
  {
    label: 'chart.preset.area-smooth', icon: areaSmoothIcon,
    displayType: 'area', curveType: 'natural',
  },
  {
    label: 'chart.preset.area-step', icon: areaStepIcon,
    displayType: 'area', curveType: 'stepAfter',
  },
  {
    label: 'chart.preset.point', icon: pointIcon,
    displayType: 'point',
  },
  {
    label: 'chart.preset.bar', icon: barIcon,
    displayType: 'bar',
  },
  {
    label: 'chart.preset.vertical', icon: verticalIcon,
    displayType: 'vertical',
  },
];
