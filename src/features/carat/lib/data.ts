const caratSettings: CaratSettings = {
  metersInMeter: 300,
};

const caratColumns: CaratColumn[] = [
  {
    type: 'Normal',
    settings: {
      label: 'Глубина', width: 40,
      showAxis: true, showGrid: false, step: 5,
    },
    plugins: {
      'stratums': {
        channelSettings: {
          fillLineChannelSettings: {
            showDiagram: true, showFill: true, showLine: false,
            zOrder: 0, thickness: 2,
            color: 'rgba(128, 128, 128, 175)',
            backgroundColor: 'rgba(255, 255, 255, 0)',
            borderColor: 'rgba(0, 0, 0, 255)',
          },
        },
        channelCaratSettings: null,
      },
      // 'Wells geometry': {
      //   channelSettings: null,
      //   channelCaratSettings: null,
      // },
    },
    channels: ['stratums' /*, 'Wells geometry'*/],
  },
  {
    type: 'Normal',
    settings: {
      label: 'Пласты', width: 40,
      showAxis: false, showGrid: false, step: 5,
    },
    plugins: {
      'Litology': {
        channelSettings: {
          fillLineChannelSettings: {
            showDiagram: false, showFill: true, showLine: false,
            zOrder: 0, thickness: 2,
            color: 'rgba(0, 144, 144, 175)',
            backgroundColor: 'rgba(118, 209, 209, 175)',
            borderColor: 'rgba(0, 0, 0, 255)',
          },
        },
        channelCaratSettings: null,
      },
    },
    channels: ['Litology'],
  },
  {
    type: 'Normal',
    settings: {
      label: 'Перфор.', width: 40,
      showAxis: false, showGrid: false, step: 5,
    },
    plugins: {
      'Perforations': {
        channelSettings: {
          fillLineChannelSettings: {
            showDiagram: false, showFill: true, showLine: false,
            zOrder: 0, thickness: 2,
            color: 'rgba(0, 144, 144, 175)',
            backgroundColor: 'rgba(244,215,228,255)',
            borderColor: 'rgba(242,148,192,255)',
          },
        },
        channelCaratSettings: null,
      },
    },
    channels: ['Perforations'],
  },
  {
    type: 'Normal',
    settings: {
      label: 'Порист.', width: 40,
      showAxis: false, showGrid: false, step: 5,
    },
    plugins: {
      'Litology': {
        channelSettings: {
          fillLineChannelSettings: {
            showDiagram: false, showFill: true, showLine: false,
            zOrder: 0, thickness: 2,
            color: 'rgba(246,199,129,255)',
            backgroundColor: 'rgba(246,199,129,255)',
            borderColor: 'rgba(133,83,10,255)',
          },
        },
        channelCaratSettings: null,
      },
    },
    channels: ['Litology'],
  },
  {
    type: 'Normal',
    settings: {
      label: 'Каротаж', width: 200,
      showAxis: false, showGrid: true, step: 10,
    },
    plugins: {
      // 'Wells geometry': {
      //   channelSettings: null,
      //   channelCaratSettings: null,
      // },
      'Carottage curves': {
        channelSettings: null,
        channelCaratSettings: null,
      },
      'stratums': {
        channelSettings: {
          fillLineChannelSettings: {
            showDiagram: true, showFill: true, showLine: false,
            zOrder: 0, thickness: 2,
            color: 'rgba(0, 144, 144, 175)',
            backgroundColor: 'rgba(118, 209, 209, 0)',
            borderColor: 'rgba(0, 0, 0, 255)',
          },
        },
        channelCaratSettings: null,
      },
    },
    channels: [/*'Wells geometry',*/ 'Carottage curves', 'stratums'],
  },
];

export const mockCaratSettings: CaratFormSettings = {
  settings: caratSettings,
  columns: caratColumns,
};
