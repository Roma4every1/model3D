import { CaratDrawerConfig } from '../rendering/drawer-settings';


/** Значения некоторых настроек по умолчанию. */
export const defaultSettings = {
  scale: 400,
  yAxisStep: 5,
  curveStyle: {thickness: 2, color: '#605656'},
  intervalStyle: {stroke: '#888888', fill: '#e8e8e8'},
};

/** Свойства для идентификации каналов. */
export const criterionProperties: Record<CaratChannelType, Record<string, string>> = {
  'lithology': {
    stratumID: 'STRATUM ID',
    top: 'TOP', bottom: 'BASE',
  },
  'perforations': {
    type: 'TYPE', date: 'DATE',
    top: 'TOP', bottom: 'BASE',
  },
  'curve-set': {
    id: 'CURVE ID', type: 'CURVE TYPE', date: 'DATE',
    top: 'DEPTH START', bottom: 'DEPTH END',
    defaultLoading: 'LOAD BY DEFAULT',
  },
  'curve-data': {
    id: 'CURVE ID', data: 'CURVE DATA',
    top: 'MIN DEPTH', bottom: 'MAX DEPTH',
    min: 'MIN VALUE', max: 'MAX VALUE',
  },
};

/** Свойства для идентификации канала с цветами пластов. */
export const styleCriterionProperties = {
  id: 'LOOKUPCODE',
  color: 'COLOR',
  borderColor: 'BORDER COLOR',
  backgroundColor: 'BACKGROUND COLOR',
  fillStyle: 'FILL STYLE',
  lineStyle: 'LINE STYLE',
};

/** Свойства для идентификации канала с подписями пластов. */
export const labelCriterionProperties = {
  id: 'LOOKUPCODE',
  value: 'LOOKUPVALUE',
};

/** Настройки отрисовки. */
export const drawerConfig: CaratDrawerConfig = {
  stage: {
    font: {size: 14, style: 'normal', family: '"Segoe UI", Roboto, sans-serif'}
  },
  track: {
    body: {
      margin: 4,
      border: {color: '#111111', thickness: 1},
    },
    header: {
      padding: 3,
      text: {font: {size: 14}, color: '#222222'},
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
    axis: {
      vertical: {
        font: {size: 12},
        color: '#333333',
        markSize: 6,
        grid: {thickness: 1, lineDash: [5, 4]},
      },
      horizontal: {
        font: {size: 13},
        thickness: 1.5,
        markSize: 8,
        gap: 2,
        grid: {thickness: 1, lineDash: [5, 4]},
      },
    },
  },
};
