import { CaratDrawerConfig } from '../rendering/drawer-settings';


/** Настройки отрисовки. */
export const drawerConfig: CaratDrawerConfig = {
  track: {
    body: {
      margin: 2,
      border: {color: '#111111', thickness: 1},
    },
    header: {
      padding: 2,
      text: {font: {size: 24, style: 'bold', family: '"Segoe UI", Roboto'}, color: '#222222'},
      border: {color: '#111111', thickness: 1},
    },
  },
  column: {
    label: {
      font: {size: 18, style: 'normal', family: '"Segoe UI", Roboto'},
      color: '#000000',
      align: 'center',
    },
    verticalAxis: {
      font: {size: 16, style: 'normal', family: '"Segoe UI", Roboto'},
      color: '#303030',
      markSize: 20, // px
    },
  },
};
