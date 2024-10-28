import { AreaDiscrIcon, AreaIcon, AreaSplineIcon, GistIcon, GraphDiscrIcon, GraphIcon, GraphSplineIcon, PointIcon, VerticalLineIcon } from '../components/edit-panel/icons';


/** Доступные штриховки линий на графике. */
export const lineDashArrays: string[] = [undefined, '3 3', '1 1', '3 1 1 1', '3 1 1 1 1 1'];

/** Типы отображения свойств на графике. */
export const chartDisplayTypes: {key: ChartDisplayType, label: string, icon: any}[] = [
  {key: 'graph', label: 'Линия', icon: GraphIcon},
  {key: 'graphSpline', label: 'Линия сплайн', icon: GraphSplineIcon},
  {key: 'graphDiscr', label: 'Линия дискретная', icon: GraphDiscrIcon},
  {key: 'area', label: 'Область', icon: AreaIcon},
  {key: 'areaSpline', label: 'Область сплайн', icon: AreaSplineIcon},
  {key: 'areaDiscr', label: 'Область дискретная', icon: AreaDiscrIcon},
  {key: 'point', label: 'Точечная', icon: PointIcon},
  {key: 'gist', label: 'Гистограмма', icon: GistIcon},
  {key: 'vertical', label: 'Вертикальная линия', icon: VerticalLineIcon},
];
