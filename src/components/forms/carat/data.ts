export const caratSettings: CaratSettings = {
  metersInMeter: 300,
  useStaticScale: false,
  mode: 'Carat',
  preferredInclChannelName: 'Wells geometry_crt',
  preferredPlastsChannelName: 'Strata wells',
};

export const caratColumns: CaratColumn[] = [
  {
    type: 'External',
    columnSettings: {label: 'Трек', width: 40, borderColor: '#808080'},
    plugins: {},
  },
  {
    type: 'External',
    columnSettings: {label: 'Корреляция', width: 40, borderColor: '#808080'},
    plugins: {},
  },
  {
    type: 'Normal',
    columnSettings: {label: 'Гл.', width: 48, borderColor: '#808080'},
    plugins: {},
  },
  {
    type: 'Normal',
    columnSettings: {label: 'Лит.', width: 40, borderColor: '#808080'},
    plugins: {},
  },
  {
    type: 'Normal',
    columnSettings: {label: 'Перф.', width: 40, borderColor: '#808080'},
    plugins: {},
  },
  {
    type: 'Normal',
    columnSettings: {label: 'Пор.', width: 40, borderColor: '#808080'},
    plugins: {},
  },
  {
    type: 'Normal',
    columnSettings: {label: '', width: 200, borderColor: '#808080'},
    plugins: {},
  },
  {
    type: 'Normal',
    columnSettings: {label: 'Потокометрия', width: 200, borderColor: '#808080'},
    plugins: {},
  },
];
