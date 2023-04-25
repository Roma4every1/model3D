import { CaratDrawerConfig } from '../rendering/drawer-settings';


/** Значения некоторых настроек по умолчанию. */
export const defaultSettings = {
  scale: 400,
};

/** Свойства для идентификации каналов. */
export const criterionProperties: Record<CaratChannelType, Record<string, string>> = {
  'lithology': {top: 'TOP', base: 'BASE', stratum: 'STRATUM ID'},
  'perforations': {top: 'TOP', base: 'BASE', type: 'TYPE', date: 'DATE'},
  'curve-set': {id: 'CURVE ID', type: 'CURVE TYPE', date: 'DATE'},
  'curve-data': {id: 'CURVE ID', data: 'CURVE DATA', top: 'MIN DEPTH', left: 'MIN VALUE'},
};

/** Настройки отрисовки. */
export const drawerConfig: CaratDrawerConfig = {
  track: {
    body: {
      margin: 4,
      border: {color: '#111111', thickness: 1},
    },
    header: {
      padding: 3,
      text: {font: {size: 16, style: 'normal', family: '"Segoe UI", Roboto'}, color: '#222222'},
      border: {color: '#111111', thickness: 1},
    },
  },
  column: {
    label: {
      font: {size: 12, style: 'normal', family: '"Segoe UI", Roboto'},
      color: '#000000',
    },
    verticalAxis: {
      font: {size: 12, style: 'normal', family: '"Segoe UI", Roboto'},
      color: '#303030',
      markSize: 6, // px
    },
  },
};
