/** Настройки отрисовщика каротажа. */
export interface CaratDrawerConfig {
  /** Глобальные настройки. */
  stage: {
    /** Величина отступов вокруг треков. */
    padding: number,
    /** Глобальные настройки шрифта сцены. */
    font: CSSFont,
  },
  /** Настройки отрисовки трека. */
  track: {
    /** Настройки тела трека. */
    body: {
      /** Цвет шапки активного трека. */
      activeColor: ColorString,
      /** Цвет рамки вокруг трека. */
      borderColor: ColorString,
      /** Толщина рамки вокруг трека. */
      borderWidth: number;
    },
    /** Настройки шапки трека. */
    header: {
      /** Величина внутренних отступов шапки. */
      padding: number,
      /** Шрифт и цвет подписи внутри шапки. */
      text: {font: Partial<CSSFont>, color: ColorString},
    },
  },
  /** Настройки отрисовки колонки. */
  column: {
    /** Настройки тела колонки. */
    body: {
      /** __Боковые__ внутренние отступы элементов. */
      padding: number,
      /** Толщина рамки и цвет активной колонки. */
      border: {thickness: number, activeColor: ColorString},
    },
    /** Настройки подписей к колонкам. */
    label: {
      /** {@link CSSFont} подписи. */
      font: Partial<CSSFont>,
      /** Цвет подписи. */
      color: ColorString,
      /** Отступ подписи сверху. */
      marginTop: number,
    },
    /** Настройки подписей по глубине. */
    mark: {
      /** Внутренние отступы подписи. */
      padding: number;
      /** Ширина рамки для текса. */
      borderWidth: number;
      /** Расстояние между меткой глубины и подписью. */
      gap: number;
    },
    /** Настройки вертикальной оси. */
    xAxis: {
      /** {@link CSSFont} подписей. */
      font: Partial<CSSFont>,
      /** {@link CSSFont} подписи активной кривой. */
      activeFont: Partial<CSSFont>,
      /** Толщина оси. */
      thickness: number,
      /** Расстояние между осями по вертикали. */
      gap: number,
      /** Толщина и штриховка линий сетки. */
      grid: {thickness: number, lineDash: number[]},
    },
    /** Настройки вертикальной оси. */
    yAxis: {
      /** {@link CSSFont} подписей. */
      font: Partial<CSSFont>,
      /** Цвет горизонтальной пометки и подписи. */
      color: ColorString,
      /** Размер горизонтальной пометки. */
      markSize: number,
      /** Толщина и штриховка линий сетки. */
      grid: {thickness: number, lineDash: number[]},
    },
  },
  /** Настройки отрисовки корреляций между треками. */
  correlation: {
    /** Толщина обводки корреляции. */
    thickness: number,
  },
  /** Настройки отрисовки конструкции скважины. */
  construction: {
    /** Настройки подписей к конструкции. */
    label: {
      /** Шрифт подписи к конструкции. */
      font: Partial<CSSFont>,
      /** Цвет подписи к конструкции. */
      color: ColorString,
      /** Фон подписи к конструкции. */
      background: ColorString,
      /** Цвет рамки подписи к конструкции. */
      borderColor: ColorString,
      /** Толщина рамки подписи к конструкции. */
      borderWidth: number,
      /** Внешний отступ подписи. */
      margin: number,
      /** Внутренний отступ подписи. */
      padding: number,
    },
    /** Настройки отображения вертикальных забоев. */
    face: {
      /** Толщина обводки. */
      borderWidth: number,
    },
    /** Настройки отображения вертикальных линий. */
    vertical: {
      /** Штриховка линии. */
      lineDash: number[],
    },
  },
}

/** Настройки отрисовки тела трека. */
export interface CaratTrackBodyDrawSettings {
  /** Величина отступов вокруг треков. */
  readonly padding: number;
  /** Цвет рамки всего трека. */
  readonly borderColor: ColorString;
  /** Толщина рамки всего трека. */
  readonly borderWidth: number;
  /** Цвет шапки активного трека. */
  readonly activeColor: ColorString;
}

/** Настройки отрисовки трека. */
export interface CaratTrackHeaderDrawSettings {
  /** Высота шапки. */
  readonly height: number;
  /** Величина внутренних отступов шапки. */
  readonly padding: number;
  /** Шрифт подписи шапки. */
  readonly font: string;
  /** Цвет подписи шапки. */
  readonly color: ColorString;
}

/** Настройки тела колонки. */
export interface CaratColumnBodyDrawSettings {
  /** Боковые внутренние отступы элементов. */
  readonly padding: number;
  /** Ширина рамки колонки. */
  readonly borderWidth: number;
  /** Цвет рамки активной колонки. */
  readonly activeBorderColor: ColorString;
}

/** Настройки отрисовки подписи колонки. */
export interface CaratColumnLabelDrawSettings {
  /** Шрифт подписи. */
  readonly font: string;
  /** Цвет подписи. */
  readonly color: ColorString;
  /** Высота подписи. */
  readonly height: number;
}

/** Настройки подписей по глубине. */
export interface CaratMarkDrawSettings {
  /** Внутренние отступы подписи. */
  readonly padding: number;
  /** Ширина рамки для текса. */
  readonly borderWidth: number;
  /** Расстояние между меткой глубины и подписью. */
  readonly gap: number;
}

/** Настройки отрисовки вертикальной оси колонки. */
export interface CaratColumnYAxisDrawSettings {
  /** Шрифт подписей. */
  readonly font: string;
  /** Цвет подписей. */
  readonly color: ColorString;
  /** Размер горизонтальной черты. */
  readonly markSize: number;
  /** Толщина линий сетки. */
  readonly gridThickness: number;
  /** Штриховка линий сетки. */
  readonly gridLineDash: number[];
}

/** Настройки отрисовки горизонтальных осей колонки. */
export interface CaratColumnXAxisDrawSettings {
  /** Шрифт подписей. */
  readonly font: string;
  /** Шрифт подпики для активной кривой. */
  readonly activeFont: string;
  /** Толщина оси. */
  readonly thickness: number;
  /** Расстояние между осями по вертикали. */
  readonly gap: number;
  /** Высота оси. */
  readonly axisHeight: number;
  /** Толщина линий сетки. */
  readonly gridThickness: number;
  /** Штриховка линий сетки. */
  readonly gridLineDash: number[];
}

/** Настройки отрисовки корреляций. */
export interface CaratCorrelationDrawSettings {
  /** Толщина обводки. */
  readonly thickness: number;
}

/** Настройки отрисовки конструкции скважины. */
export interface ConstructionDrawSettings {
  /** Шрифт подписи к конструкции. */
  readonly labelFont: string;
  /** Высота одной строки в подписи. */
  readonly labelTextHeight;
  /** Цвет подписи к конструкции. */
  readonly labelColor: ColorString;
  /** Фон подписи к конструкции. */
  readonly labelBackground: ColorString;
  /** Цвет рамки подписи к конструкции. */
  readonly labelBorderColor: ColorString;
  /** Толщина рамки подписи к конструкции. */
  readonly labelBorderWidth: number;
  /** Внешний отступ подписи. */
  readonly labelMargin: number;
  /** Внутренний отступ подписи. */
  readonly labelPadding: number;
  /** Ширина обводки забоя. */
  readonly faceBorderWidth: number;
  /** Штриховка вертикальной линии. */
  readonly verticalLineDash: number[];
}


/** Создаёт настройки отрисовки трека по конфигу. */
export function createTrackBodyDrawSettings(config: CaratDrawerConfig): CaratTrackBodyDrawSettings {
  const padding = config.stage.padding;
  const { borderWidth, borderColor, activeColor } = config.track.body;
  return {padding, borderColor, borderWidth, activeColor};
}

/** Создаёт настройки отрисовки трека по конфигу. */
export function createTrackHeaderDrawSettings(config: CaratDrawerConfig): CaratTrackHeaderDrawSettings {
  const { padding, text } = config.track.header;

  return {
    height: text.font.size + 2 * padding,
    padding: padding,
    font: buildFontString(text.font, config.stage.font),
    color: text.color,
  };
}

/** Создаёт настройки отрисовки тела колонки по конфигу. */
export function createColumnBodyDrawSettings(config: CaratDrawerConfig): CaratColumnBodyDrawSettings {
  const { padding, border } = config.column.body
  return {padding, borderWidth: border.thickness, activeBorderColor: border.activeColor};
}

/** Создаёт настройки отрисовки подписи колонки по конфигу. */
export function createColumnLabelDrawSettings(config: CaratDrawerConfig): CaratColumnLabelDrawSettings {
  const { font, color, marginTop } = config.column.label;
  const height = font.size + marginTop;
  return {font: buildFontString(font, config.stage.font), color, height};
}

/** Создаёт настройки отрисовки подписей по глубине по конфигу. */
export function createMarkDrawSettings(config: CaratDrawerConfig): CaratMarkDrawSettings {
  return config.column.mark;
}

/** Создаёт настройки отрисовки вертикальной оси колонки по конфигу. */
export function createColumnYAxisDrawSettings(config: CaratDrawerConfig): CaratColumnYAxisDrawSettings {
  const { font, color, markSize, grid } = config.column.yAxis;
  return {
    font: buildFontString(font, config.stage.font), color, markSize,
    gridThickness: grid.thickness, gridLineDash: grid.lineDash,
  };
}

/** Создаёт настройки отрисовки горизонтальных осей колонки по конфигу. */
export function createColumnXAxisDrawSettings(config: CaratDrawerConfig): CaratColumnXAxisDrawSettings {
  const { font, activeFont, thickness, gap, grid } = config.column.xAxis;
  const axisHeight = font.size + 3 * thickness;

  return {
    font: buildFontString(font, config.stage.font),
    activeFont: buildFontString(activeFont, config.stage.font),
    thickness, gap, axisHeight,
    gridThickness: grid.thickness, gridLineDash: grid.lineDash
  };
}

/** Создаёт настройки отрисовки корреляций по конфигу. */
export function createCorrelationDrawSettings(config: CaratDrawerConfig): CaratCorrelationDrawSettings {
  return {thickness: config.correlation.thickness};
}

/** Создаёт настройки отрисовки конструкции по конфигу. */
export function createConstructionDrawSettings(config: CaratDrawerConfig): ConstructionDrawSettings {
  const labelSettings = config.construction.label;
  const labelFont = buildFontString(labelSettings.font, config.stage.font);

  return {
    labelFont: labelFont,
    labelTextHeight: labelSettings.font.size,
    labelColor: labelSettings.color,
    labelBackground: labelSettings.background,
    labelBorderColor: labelSettings.borderColor,
    labelBorderWidth: labelSettings.borderWidth,
    labelMargin: labelSettings.margin,
    labelPadding: labelSettings.padding,
    faceBorderWidth: config.construction.face.borderWidth,
    verticalLineDash: config.construction.vertical.lineDash,
  };
}

/** Преобразует модель шрифта в `canvas.font`. */
function buildFontString(font: Partial<CSSFont>, defaultFont: CSSFont): string {
  const style = font.style ?? defaultFont.style;
  const size = font.size ?? defaultFont.size;
  const family = font.family ?? defaultFont.family;
  return `${style} ${size}px ${family}`;
}
