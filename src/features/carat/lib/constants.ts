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
    well: {name: 'WELL ID'},
    top: {name: 'TOP'},
    bottom: {name: 'BASE'},
    stratumID: {name: 'STRATUM ID'},
  },
  'perforations': {
    well: {name: 'WELL ID'},
    top: {name: 'TOP'},
    bottom: {name: 'BASE'},
    type: {name: 'TYPE'},
    date: {name: 'DATE'},
  },
  'curve-set': {
    well: {name: 'WELL ID'},
    id: {name: 'CURVE ID'},
    top: {name: 'DEPTH START'},
    bottom: {name: 'DEPTH END'},
    type: {name: 'CURVE TYPE'},
    date: {name: 'DATE'},
    defaultLoading: {name: 'LOAD BY DEFAULT'},
    description: {name: 'DESCRIPTION', optional: true},
  },
  'curve-data': {
    id: {name: 'CURVE ID'},
    data: {name: 'CURVE DATA'},
    top: {name: 'MIN DEPTH'},
    bottom: {name: 'MAX DEPTH'},
    min: {name: 'MIN VALUE'},
    max: {name: 'MAX VALUE'},
  },
  'inclinometry': {
    well: {name: 'WELL ID'},
    inclinometry: {name: 'INCLINOMETRY'},
  },
  'bore': {
    well: {name: 'WELL ID'},
    top: {name: 'TOP'},
    bottom: {name: 'BASE'},
    innerDiameter: {name: 'IN_D'},
    outerDiameter: {name: 'OUT DIAMETER'},
    cement: {name: 'CEMENT'},
    label: {name: 'LABEL_ZEM'},
  },
  'pump': {
    well: {name: 'WELL ID'},
    top: {name: 'TOP'},
    bottom: {name: 'BASE'},
    pumpID: {name: 'PUMP IMAGE'},
    pumpName: {name: 'NAME'},
    label: {name: 'LABEL_SP'},
  },
  'face': {
    well: {name: 'WELL ID'},
    top: {name: 'TOP'},
    bottom: {name: 'BASE'},
    diameter: {name: 'OUT_D'},
    type: {name: 'TYPE'},
    date: {name: 'DT'},
    label: {name: 'LABEL_ZB'},
  },
  'vertical': {
    well: {name: 'WELL ID'},
    top: {name: 'TOP'},
    bottom: {name: 'BASE'},
    width: {name: 'WIDTH'},
  },
};

/** Канал с картинками насоса. */
export const pumpImageCriterion: ChannelCriterion = {
  id: {name: 'LOOKUPCODE'},
  image: {name: 'LOOKUPVALUE'},
};

/** Свойства для идентификации канала с данными инклинометрии. */
export const inclinometryCriterion: ChannelCriterion = {
  well: {name: 'WELL ID'},
  depth: {name: 'DEPTH'},
  absMark: {name: 'ABSMARK'},
};

/** Свойства для идентификации канала с цветами пластов. */
export const lithologyStyleCriterion: ChannelCriterion = {
  id: {name: 'LOOKUPCODE'},
  color: {name: 'COLOR'},
  borderColor: {name: 'BORDER COLOR'},
  backgroundColor: {name: 'BACKGROUND COLOR'},
  fillStyle: {name: 'FILL STYLE'},
  lineStyle: {name: 'LINE STYLE'},
};

/** Свойства для идентификации канала с подписями пластов. */
export const lithologyLabelCriterion: ChannelCriterion = {
  id: {name: 'LOOKUPCODE'},
  value: {name: 'LOOKUPVALUE'},
};

/** Свойства для идентификации справочника с цветами кривых. */
export const curveColorCriterion: ChannelCriterion = {
  type: {name: 'LOOKUPCODE'},
  color: {name: 'COLOR'},
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
    face: {
      borderThickness: 2,
    },
    vertical: {
      lineDash: [10, 10],
    },
  },
};
