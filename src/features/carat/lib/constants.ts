import { CaratDrawerConfig } from '../rendering/drawer-settings';


/** Значения некоторых настроек по умолчанию. */
export const defaultSettings = {
  scale: 400,
  curveStyle: {thickness: 2, color: '#694444'},
  intervalStyle: {borderColor: '#888888', backgroundColor: '#e8e8e8'},
};

/** Свойства для идентификации каналов. */
export const criterionProperties: Record<CaratChannelType, Record<string, string>> = {
  'lithology': {top: 'TOP', base: 'BASE', stratum: 'STRATUM ID'},
  'perforations': {top: 'TOP', base: 'BASE', type: 'TYPE', date: 'DATE'},
  'curve-set': {id: 'CURVE ID', type: 'CURVE TYPE', date: 'DATE'},
  'curve-data': {id: 'CURVE ID', data: 'CURVE DATA', top: 'MIN DEPTH', bottom: 'MAX DEPTH'},
};

/** Свойства для идентификации канала с цветами пластов. */
export const styleCriterionProperties = {
  id: 'LOOKUPCODE',
  borderColor: 'BORDER COLOR',
  backgroundColor: 'BACKGROUND COLOR',
  fillStyle: 'FILL STYLE',
  lineStyle: 'LINE STYLE',
};

/** Настройки отрисовки. */
export const drawerConfig: CaratDrawerConfig = {
  track: {
    body: {
      margin: 4, // px
      border: {color: '#111111', thickness: 1},
    },
    header: {
      padding: 3, // px
      text: {font: {size: 16, style: 'normal', family: '"Segoe UI", Roboto'}, color: '#222222'},
      border: {color: '#111111', thickness: 1},
    },
  },
  column: {
    body: {
      padding: 1, // px
      border: {thickness: 1, activeColor: '#252525'}
    },
    label: {
      font: {size: 12, style: 'normal', family: '"Segoe UI", Roboto'},
      color: '#000000',
    },
    verticalAxis: {
      font: {size: 12, style: 'normal', family: '"Segoe UI", Roboto'},
      color: '#333333',
      markSize: 6, // px
    },
  },
};
