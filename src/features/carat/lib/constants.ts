import type { ButtonSwitchProps } from 'shared/ui';
import type { CaratMarkSettingsDTO } from './mark.types';
import type { CaratDrawerConfig } from '../rendering/drawer-settings';


/** Виды экспорта каротажа в картинку. */
export const caratExportModes: ButtonSwitchProps<number>['options'] = [
  {label: 'Видимая часть', value: 0},
  {label: 'Весь трек', value: 1},
  {label: 'По глубине', value: 2},
];

/** Значения некоторых настроек по умолчанию. */
export const defaultSettings = {
  scale: 400,
  yAxisStep: 5,
  xAxis: {
    numberOfMarks: 2,
    grid: false,
  },
  curveStyle: {
    thickness: 2,
    color: '#605656',
  },
  intervalStyle: {
    stroke: '#888888',
    fill: '#e8e8e8',
  },
  wellBoreElementStyle: {
    innerDiameter: '#d9d9d9',
    outerDiameter: '#808080',
    cement: '#ffa500',
  },
  verticalLineColor: '#007dea',
};

export const defaultMarkSettings: Required<CaratMarkSettingsDTO> = {
  text: {
    align: 'center',
    fontSize: 12,
    color: '#222222',
    backgroundColor: '#f8f8f8',
    borderColor: '#808080'
  },
  line: {
    color: '#605656',
    width: 1,
  },
  showDepth: true, showLine: true,
};

/** Ограничения на различные настройки каротажа. */
export const constraints = {
  yAxisMarks: {min: 2, max: 12},
  groupLabel: {max: 100}, // length,
  groupStep: {min: 1, max: 100},
  groupWidth: {min: 0, max: 1000},
  scale: {min: 1, max: 25_000},
};

/** Настройки отрисовки. */
export const drawerConfig: CaratDrawerConfig = {
  stage: {
    padding: 4,
    font: {size: 13, style: 'normal', family: 'Roboto'},
  },
  track: {
    body: {
      activeColor: '#ffeeee',
      borderColor: '#111111',
      borderWidth: 1,
    },
    header: {
      padding: 3,
      text: {font: {size: 13}, color: '#222222'},
    },
  },
  column: {
    body: {
      padding: 1,
      border: {thickness: 1, activeColor: '#252525'}
    },
    label: {
      font: {size: 12},
      color: '#000000',
      marginTop: 4,
    },
    mark: {
      padding: 1,
      borderWidth: 1,
      gap: 4,
    },
    xAxis: {
      font: {size: 12},
      activeFont: {size: 12, style: 'bold'},
      thickness: 1.5,
      gap: 2,
      grid: {thickness: 1, lineDash: [5, 4]},
    },
    yAxis: {
      font: {size: 12},
      color: '#333333',
      markSize: 6,
      grid: {thickness: 1, lineDash: [5, 4]},
    },
  },
  correlation: {
    thickness: 1,
  },
  construction: {
    label: {
      font: {size: 12},
      color: '#111111',
      background: '#fff69b',
      borderColor: '#cb7b7a',
      borderWidth: 2,
      margin: 8,
      padding: 6,
    },
    face: {
      borderWidth: 2,
    },
    vertical: {
      lineDash: [10, 10],
    },
  },
};
