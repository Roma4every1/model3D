export const mockCaratSettings: CaratFormSettings = {
  id: null,
  settings: {
    scale: 300, useStaticScale: false,
    strataChannelName: null, zones: [
      {
        relativeWidth: null,
        types: [
          'PZ', 'PZ, OHMM', 'PS', 'PS, MV', 'DS',
          'ДС, МЕТР', 'ПС, MV', 'ДС, ММ', 'ДС, М'
        ],
      },
      {
        relativeWidth: null,
        types: [
          'PK', 'AK', 'GGK', 'GK', 'GK, UREM/H', 'NGK',
          'NGK, 1/MIN', 'НГК, УС.Е', 'ГК, МР/Ч', 'НГК, УСЕД', 'ГК, МК/Ч'
        ],
      },
      {
        relativeWidth: null,
        types: [
          'IK', 'BK', 'ИК, OHMM', 'БК, ОММ', 'ИК, ОММ', 'БК, OHMM'
        ],
      },
    ],
  },
  columns: [
    {
      id: '',
      settings: {type: 'background', label: 'Трек', width: 360, index: -1},
      xAxis: {grid: false, numberOfMarks: 3},
      yAxis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
      channels: [
        {name: 'stratums', attachOption: 'AttachNothing', exclude: null}
      ],
      selection: {
        types: [
          {expression: '^PZ$', isSelected: true},
          {expression: '^PS$', isSelected: true},
          {expression: '^DS$', isSelected: true},
          {expression: '^PK$', isSelected: true},
          {expression: '^AK$', isSelected: true},
          {expression: '^GGK$', isSelected: true},
          {expression: '^GK$', isSelected: true},
          {expression: '^NGK$', isSelected: true},
          {expression: '^IK$', isSelected: true},
          {expression: '^BK$', isSelected: true},
        ],
        start: '2000-01-01', end: 'now',
      },
      measures: [],
      properties: {},
      active: false,
    },
    {
      id: '',
      settings: {type: 'normal', label: 'Глубина', width: 40, index: 0},
      xAxis: {grid: false, numberOfMarks: 3},
      yAxis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
      channels: [
        {name: 'Perforations', attachOption: 'AttachNothing', exclude: ['TYPE']},
      ],
      selection: {
        types: [
          {expression: '^PZ$', isSelected: true},
          {expression: '^PS$', isSelected: true},
          {expression: '^DS$', isSelected: true},
          {expression: '^PK$', isSelected: true},
          {expression: '^AK$', isSelected: true},
          {expression: '^GGK$', isSelected: true},
          {expression: '^GK$', isSelected: true},
          {expression: '^NGK$', isSelected: true},
          {expression: '^IK$', isSelected: true},
          {expression: '^BK$', isSelected: true},
        ],
        start: '2000-01-01', end: 'now',
      },
      measures: [],
      properties: {},
      active: false,
    },
    {
      id: '',
      settings: {type: 'normal', label: 'Пласты', width: 40, index: 1},
      xAxis: {grid: false, numberOfMarks: 3},
      yAxis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
      channels: [

      ],
      selection: {
        types: [
          {expression: '^PZ$', isSelected: true},
          {expression: '^PS$', isSelected: true},
          {expression: '^DS$', isSelected: true},
          {expression: '^PK$', isSelected: true},
          {expression: '^AK$', isSelected: true},
          {expression: '^GGK$', isSelected: true},
          {expression: '^GK$', isSelected: true},
          {expression: '^NGK$', isSelected: true},
          {expression: '^IK$', isSelected: true},
          {expression: '^BK$', isSelected: true},
        ],
        start: '2000-01-01', end: 'now',
      },
      measures: [],
      properties: {},
      active: false,
    },
    {
      id: '',
      settings: {type: 'normal', label: 'Перфор.', width: 40, index: 2},
      xAxis: {grid: false, numberOfMarks: 3},
      yAxis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
      channels: [

      ],
      selection: {
        types: [
          {expression: '^PZ$', isSelected: true},
          {expression: '^PS$', isSelected: true},
          {expression: '^DS$', isSelected: true},
          {expression: '^PK$', isSelected: true},
          {expression: '^AK$', isSelected: true},
          {expression: '^GGK$', isSelected: true},
          {expression: '^GK$', isSelected: true},
          {expression: '^NGK$', isSelected: true},
          {expression: '^IK$', isSelected: true},
          {expression: '^BK$', isSelected: true},
        ],
        start: '2000-01-01', end: 'now',
      },
      measures: [],
      properties: {},
      active: false,
    },
    {
      id: '',
      settings: {type: 'normal', label: 'Порист.', width: 40, index: 3},
      xAxis: {grid: false, numberOfMarks: 3},
      yAxis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
      channels: [

      ],
      selection: {
        types: [
          {expression: '^PZ$', isSelected: true},
          {expression: '^PS$', isSelected: true},
          {expression: '^DS$', isSelected: true},
          {expression: '^PK$', isSelected: true},
          {expression: '^AK$', isSelected: true},
          {expression: '^GGK$', isSelected: true},
          {expression: '^GK$', isSelected: true},
          {expression: '^NGK$', isSelected: true},
          {expression: '^IK$', isSelected: true},
          {expression: '^BK$', isSelected: true},
        ],
        start: '2000-01-01', end: 'now',
      },
      measures: [],
      properties: {},
      active: false,
    },
    {
      id: '',
      settings: {type: 'normal', label: 'Каротаж', width: 200, index: 4},
      xAxis: {grid: false, numberOfMarks: 3},
      yAxis: {show: false, step: 5, grid: false, absMarks: true, depthMarks: true},
      channels: [

      ],
      selection: {
        types: [
          {expression: '^PZ$', isSelected: true},
          {expression: '^PS$', isSelected: true},
          {expression: '^DS$', isSelected: true},
          {expression: '^PK$', isSelected: true},
          {expression: '^AK$', isSelected: true},
          {expression: '^GGK$', isSelected: true},
          {expression: '^GK$', isSelected: true},
          {expression: '^NGK$', isSelected: true},
          {expression: '^IK$', isSelected: true},
          {expression: '^BK$', isSelected: true},
        ],
        start: '2000-01-01', end: 'now',
      },
      measures: [],
      properties: {},
      active: false,
    },
  ],
};
