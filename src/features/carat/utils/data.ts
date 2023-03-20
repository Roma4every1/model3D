export const caratSettings: CaratSettings = {
  metersInMeter: 300,
  useStaticScale: false,
  mode: 'Carat',
  preferredInclChannelName: 'Wells geometry_crt',
  preferredPlastsChannelName: 'Strata wells',
};

const dataSelection: CaratDataSelection = {
  isCurveSelectingHidden: false,
  start: '2000-01-01',
  end: 'now',
  selection: [
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
};

export const caratColumns: CaratColumn[] = [
  {
    type: 'External',
    columnSettings: {label: 'Трек', width: 40, borderColor: '#808080'},
    zones: [],
    plugins: {},
  },
  {
    type: 'External',
    columnSettings: {label: 'Корреляция', width: 40, borderColor: '#808080'},
    zones: [],
    plugins: {},
  },
  {
    type: 'Normal',
    columnSettings: {
      label: 'Гл.',
      width: 48,
      borderThickness: {top: 0.5, left: 0.5, bottom: 0.5, right: 0.5},
      index: 0,
      margin: {top: 0, left: 1, bottom: 0, right: 1},
      visibleSubColumns: 3,
      subColumnBorderSize: 1,
      type: 'Normal',
      borderColor: '#808080',
      /* --- --- --- */
      showAxis: true,
      showGrid: false,
      showDepthMarks: true,
      showAbsMarks: true,
      axisDisplaySettings: {zOrder: 50_000, step: 5, heightGrid: 50},
    },
    zones: [],
    plugins: {
      'Wells geometry_crt': {
        dataSelection: dataSelection,
        channelCaratSettings: {
          displaySettings: {
            isConstructionMode: false,
            showDepthMarks: true,
            showAbsMarks: true,
            zOrder: 0,
            axisHeight: 20,
            numberOfMarks: 6,
            showVGrid: true,
          },
        },
      },
      'Strata wells': {
        dataSelection: dataSelection,
        channelCaratSettings: {
          displaySettings: {
            isConstructionMode: false,
            showDepthMarks: true,
            showAbsMarks: true,
            zOrder: 0,
            axisHeight: 20,
            numberOfMarks: 6,
            showVGrid: true,
          },
        },
        channelSettings: {
          fillLineChannelSetting: {
            showDiagram: true,
            displaySettings: {
              isConstructionMode: false,
              showAbsMarks: true,
              showDepthMarks: true,
              zOrder: 10_000,
              color: 'rgba(128, 128, 128, 175)',
              backgroundColor: 'rgba(255, 255, 255, 0)',
              borderColor: 'rgba(128, 128, 128, 255)',
              thickness: 2,
              showFill: true,
              showLine: false,
              align: 'left',
              maxFixedValue: null,
            },
          },
        },
      }
    },
  },
  {
    type: 'Normal',
    columnSettings: {label: 'Лит.', width: 40, borderColor: '#808080'},
    zones: [],
    plugins: {},
  },
  {
    type: 'Normal',
    columnSettings: {label: 'Перф.', width: 40, borderColor: '#808080',},
    zones: [],
    plugins: {},
  },
  // {
  //   type: 'Normal',
  //   columnSettings: {label: 'Пор.', width: 40, borderColor: '#808080'},
  //   zones: [],
  //   plugins: {},
  // },
  // {
  //   type: 'Normal',
  //   columnSettings: {label: 'Потокометрия', width: 200, borderColor: '#808080'},
  //   zones: [],
  //   plugins: {
  //     'Flow wells': {
  //       dataSelection: dataSelection,
  //     },
  //   },
  // },
  {
    type: 'Normal',
    zones: [
      {types: ['PZ', 'PZ, OHMM', 'PS', 'PS, MV', 'DS', 'ДС, МЕТР', 'ПС, MV', 'ДС, ММ', 'ДС, М']},
      {
        types: [
          'PK', 'AK', 'GGK', 'GK', 'GK, UREM/H', 'NGK', 'NGK, 1/MIN',
          'НГК, УС.Е', 'ГК, МР/Ч', 'НГК, УСЕД', 'ГК, МК/Ч'
        ]
      },
      {types: ['IK', 'BK', 'ИК, OHM', 'БК, ОММ', 'ИК, ОММ', 'БК, OHMM']},
    ],
    columnSettings: {
      label: '',
      width: 200,
      borderThickness: {top: 0.5, left: 0.5, bottom: 0.5, right: 0.5},
      index: 6,
      margin: {top: 0, left: 1, bottom: 0, right: 1},
      visibleSubColumns: 4,
      subColumnBorderSize: 1,
      type: 'Normal',
      borderColor: '#808080',
      /* --- --- */
      showAxis: false,
      showGrid: true,
      showDepthMarks: true,
      showAbsMarks: true,
      axisDisplaySettings: {step: 10, heightGrid: 50, zOrder: 40_000},
    },
    plugins: {
      'Carottage curves wells': {
        dataSelection: dataSelection,
        channelCaratSettings: {
          displaySettings: {
            isConstructionMode: false,
            showAbsMarks: true,
            showDepthMarks: true,
            zOrder: 60_000,
            axisHeight: 20,
            numberOfMarks: 3,
            showVGrid: true,
          },
        },
        channelSettings: null,
      },
      'Wells geometry_crt': {
        dataSelection: dataSelection,
        channelCaratSettings: {
          displaySettings: {
            isConstructionMode: false,
            showAbsMarks: true,
            showDepthMarks: true,
            zOrder: 0,
            axisHeight: 20,
            numberOfMarks: 6,
            showVGrid: true,
          },
        },
        channelSettings: null,
      },
      'LOAD CARAT POINTS': {
        dataSelection: dataSelection,
        channelCaratSettings: {
          displaySettings: {
            isConstructionMode: false,
            showAbsMarks: true,
            showDepthMarks: true,
            zOrder: 0,
            axisHeight: 20,
            numberOfMarks: 6,
            showVGrid: true,
          },
        },
        channelSettings: null,
      },
      'Strata wells': {
        dataSelection: dataSelection,
        channelCaratSettings: {
          displaySettings: {
            isConstructionMode: false,
            showAbsMarks: true,
            showDepthMarks: true,
            zOrder: 0,
            axisHeight: 20,
            numberOfMarks: 6,
            showVGrid: true,
          },
        },
        channelSettings: {
          fillLineChannelSetting: {
            showDiagram: true,
            displaySettings: {
              isConstructionMode: false,
              showAbsMarks: true,
              showDepthMarks: true,
              zOrder: 0,
              color: 'rgba(0, 144, 144, 175)',
              backgroundColor: 'rgba(118, 209, 209, 175)',
              borderColor: 'rgba(0, 144, 144, 255)',
              thickness: 2,
              showFill: true,
              showLine: false,
              align: 'left',
              maxFixedValue: null,
            },
          },
          propertiesSettings: {
            propertyName: 'STRATUM ID',
            textDisplaySettings: {
              isConstructionMode: false,
              showAbsMarks: true,
              showDepthMarks: true,
              zOrder: 70_000,
              color: 'rgba(70, 70, 70, 255)',
              backgroundColor: 'rgba(255, 255, 255, 175)',
              fontSize: 10,
              angle: 0,
            },
            barDisplaySettings: {
              isConstructionMode: false,
              showAbsMarks: true,
              showDepthMarks: true,
              zOrder: 0,
              externalColor: 'rgba(255, 255, 255, 0)',
              externalBorderColor: 'rgba(255, 255, 255, 0)',
              externalThickness: 2,
              internalColor: 'rgba(46, 175, 0, 175)',
              internalBackgroundColor: 'rgba(147, 209, 118, 175)',
              internalBorderColor: 'rgba(46, 145, 0, 255)',
              internalThickness: 2,
              secondBorderColor: 'rgba(255, 165, 0, 255)',
              alignment: 'left',
              maxFixedValue: null,
              isElements: false,
            },
          },
        },
      },
    },
  },
];
