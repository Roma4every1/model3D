import { CaratDrawerConfig } from '../rendering/drawer-settings';


/** Настройки отрисовки. */
export const drawerConfig: CaratDrawerConfig = {
  track: {
    body: {
      margin: 2,
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
