const caratColumns: CaratColumn[] = [
  {
    type: 'Background',
    settings: {label: 'Трек', width: 360, index: -1},
    axis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
    channels: [
      {name: 'stratums', attachOption: 'AttachNothing', exclude: null}
    ],
    zones: null,
    selection: null,
    plugins: {},
  },
  {
    type: 'Normal',
    settings: {label: 'Глубина', width: 40, index: 0},
    axis: {show: true, step: 5, grid: false, absMarks: true, depthMarks: true},
    channels: [
      {name: 'Perforations', attachOption: 'AttachNothing', exclude: ['TYPE']},
    ],
    zones: null,
    selection: null,
    plugins: {},
  },
  {
    type: 'Normal',
    settings: {label: 'Пласты', width: 40, index: 1},
    axis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
    channels: [

    ],
    zones: null,
    selection: null,
    plugins: {},
  },
  {
    type: 'Normal',
    settings: {label: 'Перфор.', width: 40, index: 2},
    axis: null,
    channels: [

    ],
    zones: null,
    selection: null,
    plugins: {},
  },
  {
    type: 'Normal',
    settings: {label: 'Порист.', width: 40, index: 3},
    axis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
    channels: [

    ],
    zones: null,
    selection: null,
    plugins: {},
  },
  {
    type: 'Normal',
    settings: {label: 'Каротаж', width: 200, index: 4},
    axis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
    channels: [

    ],
    zones: null,
    selection: null,
    plugins: {},
  },
];

export const mockCaratSettings: CaratFormSettings = {
  settings: {
    metersInMeter: 300, useStaticScale: false,
    strataChannelName: null,
  },
  columns: caratColumns,
};
