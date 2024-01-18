import { CaratDrawerConfig } from '../rendering/drawer-settings';


/** Значения некоторых настроек по умолчанию. */
export const defaultSettings = {
  scale: 400,
  yAxisStep: 5,
  xAxis: {
    numberOfMarks: 2,
    grid: false,
  },
  curveStyle: {
    thickness: 2,
    color: '#605656',
  },
  intervalStyle: {
    stroke: '#888888',
    fill: '#e8e8e8',
  },
  wellBoreElementStyle: {
    innerDiameter: '#d9d9d9',
    outerDiameter: '#808080',
    cement: '#ffa500',
  },
  verticalLineColor: '#007dea',
};

/** Ограничения на различные настройки каротажа. */
export const constraints = {
  yAxisMarks: {min: 2, max: 12},
  groupLabel: {max: 100}, // length,
  groupStep: {min: 1, max: 100},
  groupWidth: {min: 0, max: 1000},
  scale: {min: 1, max: 25_000},
};

/** Свойства для идентификации каналов. */
export const caratChannelCriterionDict: Record<CaratChannelType, ChannelCriterion> = {
  'lithology': {
    well: 'WELL ID', stratumID: 'STRATUM ID',
    top: 'TOP', bottom: 'BASE',
  },
  'perforations': {
    well: 'WELL ID',
    type: 'TYPE', date: 'DATE',
    top: 'TOP', bottom: 'BASE',
  },
  'curve-set': {
    well: 'WELL ID', id: 'CURVE ID',
    type: 'CURVE TYPE', date: 'DATE',
    top: 'DEPTH START', bottom: 'DEPTH END',
    defaultLoading: 'LOAD BY DEFAULT',
    description: {name: 'DESCRIPTION', optional: true},
  },
  'curve-data': {
    id: 'CURVE ID', data: 'CURVE DATA',
    top: 'MIN DEPTH', bottom: 'MAX DEPTH',
    min: 'MIN VALUE', max: 'MAX VALUE',
  },
  'inclinometry': {
    well: 'WELL ID',
    inclinometry: 'INCLINOMETRY',
  },
  'construction': {
    well: 'WELL ID', top: 'TOP', bottom: 'BASE',
    innerDiameter: 'IN_D', outerDiameter: 'OUT DIAMETER',
    cement: 'CEMENT', label: 'LABEL_ZEM',
  },
  'pump': {
    well: 'WELL ID', top: 'TOP', bottom: 'BASE',
    pumpID: 'PUMP IMAGE', pumpName: 'NAME', label: 'LABEL_SP',
  },
  'face': {
    well: 'WELL ID',
    top: 'TOP', bottom: 'BASE', diameter: 'OUT_D',
    type: 'TYPE', date: 'DT', label: 'LABEL_ZB',
  },
  'vertical': {
    well: 'WELL ID',
    top: 'TOP', bottom: 'BASE', width: 'WIDTH',
  },
};

/** Канал с картинками насоса. */
export const pumpImageCriterion: ChannelCriterion = {
  id: 'LOOKUPCODE',
  image: 'LOOKUPVALUE',
};

/** Свойства для идентификации канала с данными инклинометрии. */
export const inclinometryCriterion: ChannelCriterion = {
  well: 'WELL ID',
  depth: 'DEPTH',
  absMark: 'ABSMARK',
};

/** Свойства для идентификации канала с цветами пластов. */
export const lithologyStyleCriterion: ChannelCriterion = {
  id: 'LOOKUPCODE',
  color: 'COLOR',
  borderColor: 'BORDER COLOR',
  backgroundColor: 'BACKGROUND COLOR',
  fillStyle: 'FILL STYLE',
  lineStyle: 'LINE STYLE',
};

/** Свойства для идентификации канала с подписями пластов. */
export const lithologyLabelCriterion: ChannelCriterion = {
  id: 'LOOKUPCODE',
  value: 'LOOKUPVALUE',
};

/** Свойства для идентификации справочника с цветами кривых. */
export const curveColorCriterion: ChannelCriterion = {
  type: 'LOOKUPCODE',
  color: 'COLOR',
};

/** Настройки отрисовки. */
export const drawerConfig: CaratDrawerConfig = {
  stage: {
    padding: 4,
    font: {size: 14, style: 'normal', family: '"Segoe UI", Roboto, sans-serif'}
  },
  track: {
    body: {
      activeColor: '#ffeeee',
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
        activeFont: {size: 13, style: 'bold'},
        thickness: 1.5,
        markSize: 8,
        gap: 2,
        grid: {thickness: 1, lineDash: [5, 4]},
      },
    },
  },
  correlation: {
    thickness: 1,
  },
  construction: {
    label: {
      font: {size: 12},
      color: '#111111',
      background: '#fff69b',
      border: {color: '#cb7b7a', thickness: 2},
      margin: 8,
      padding: 6,
    },
    vertical: {
      lineDash: [10, 10],
    },
  },
};
