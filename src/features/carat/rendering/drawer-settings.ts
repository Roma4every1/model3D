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
      /** Цвет и толщина рамки вокруг трека. */
      border: {color: ColorHEX, thickness: number},
    },
    /** Настройки шапки трека. */
    header: {
      /** Величина внутренних отступов шапки. */
      padding: number,
      /** Шрифт и цвет подписи внутри шапки. */
      text: {font: Partial<CSSFont>, color: ColorHEX},
    },
  },
  /** Настройки отрисовки колонки. */
  column: {
    /** Настройки тела колонки. */
    body: {
      /** __Боковые__ внутренние отступы элементов. */
      padding: number,
      /** Толщина рамки и цвет активной колонки. */
      border: {thickness: number, activeColor: ColorHEX},
    },
    /** Настройки подписей к колонкам. */
    label: {
      /** {@link CSSFont} подписи. */
      font: Partial<CSSFont>,
      /** Цвет подписи. */
      color: ColorHEX,
      /** Отступ подписи сверху. */
      marginTop: number,
    },
    /** Настройки осей. */
    axis: {
      /** Настройки вертикальной оси. */
      vertical: {
        /** {@link CSSFont} подписей. */
        font: Partial<CSSFont>,
        /** Цвет горизонтальной пометки и подписи. */
        color: ColorHEX,
        /** Размер горизонтальной пометки. */
        markSize: number,
        /** Толщина и штриховка линий сетки. */
        grid: {thickness: number, lineDash: number[]},
      },
      /** Настройки горизонтальных осей кривых. */
      horizontal: {
        /** {@link CSSFont} подписей. */
        font: Partial<CSSFont>,
        /** Толщина оси. */
        thickness: number,
        /** Размер вертикальной пометки. */
        markSize: number,
        /** Расстояние между осями по вертикали. */
        gap: number,
        /** Толщина и штриховка линий сетки. */
        grid: {thickness: number, lineDash: number[]},
      },
    },
  },
  correlation: {
    thickness: number,
  },
}

/** Настройки отрисовки тела трека. */
export interface CaratTrackBodyDrawSettings {
  /** Величина отступов вокруг треков. */
  readonly padding: number,
  /** Цвет рамки всего трека. */
  readonly borderColor: ColorHEX,
  /** Толщина рамки всего трека. */
  readonly borderThickness: number,
}

/** Настройки отрисовки трека. */
export interface CaratTrackHeaderDrawSettings {
  /** Высота шапки. */
  readonly height: number,
  /** Величина внутренних отступов шапки. */
  readonly padding: number,
  /** Шрифт подписи шапки. */
  readonly font: string,
  /** Цвет подписи шапки. */
  readonly color: ColorHEX,
}

/** Настройки тела колонки. */
export interface CaratColumnBodyDrawSettings {
  /** Боковые внутренние отступы элементов. */
  readonly padding: number,
  /** Толщина рамки колонки. */
  readonly borderThickness: number,
  /** Цвет рамки активной колонки. */
  readonly activeBorderColor: ColorHEX,
}

/** Настройки отрисовки подписи колонки. */
export interface CaratColumnLabelDrawSettings {
  /** Шрифт подписи. */
  readonly font: string,
  /** Цвет подписи. */
  readonly color: ColorHEX,
  /** Высота подписи. */
  readonly height: number,
}

/** Настройки отрисовки вертикальной оси колонки. */
export interface CaratColumnYAxisDrawSettings {
  /** Шрифт подписей. */
  readonly font: string,
  /** Цвет подписей. */
  readonly color: ColorHEX,
  /** Размер горизонтальной черты. */
  readonly markSize: number,
  /** Толщина линий сетки. */
  readonly gridThickness: number,
  /** Штриховка линий сетки. */
  readonly gridLineDash: number[],
}

/** Настройки отрисовки горизонтальных осей колонки. */
export interface CaratColumnXAxesDrawSettings {
  /** Шрифт подписей. */
  readonly font: string,
  /** Толщина оси. */
  readonly thickness: number,
  /** Размер горизонтальной черты. */
  readonly markSize: number,
  /** Расстояние между осями по вертикали. */
  readonly gap: number,
  /** Высота оси. */
  readonly axisHeight: number,
  /** Толщина линий сетки. */
  readonly gridThickness: number,
  /** Штриховка линий сетки. */
  readonly gridLineDash: number[],
}

/** Настройки отрисовки корреляций. */
export interface CaratCorrelationDrawSettings {
  /** Толщина обводки. */
  readonly thickness: number,
}


/** Создаёт настройки отрисовки трека по конфигу. */
export function createTrackBodyDrawSettings(config: CaratDrawerConfig): CaratTrackBodyDrawSettings {
  const padding = config.stage.padding;
  const { border } = config.track.body;
  return {padding, borderColor: border.color, borderThickness: border.thickness};
}

/** Создаёт настройки отрисовки трека по конфигу. */
export function createTrackHeaderDrawSettings(config: CaratDrawerConfig): CaratTrackHeaderDrawSettings {
  const { padding, text } = config.track.header;

  return {
    height: text.font.size + 2 * padding,
    padding: padding,
    font: getFont(text.font, config.stage.font),
    color: text.color,
  };
}

/** Создаёт настройки отрисовки тела колонки по конфигу. */
export function createColumnBodyDrawSettings(config: CaratDrawerConfig): CaratColumnBodyDrawSettings {
  const { padding, border } = config.column.body
  return {padding, borderThickness: border.thickness, activeBorderColor: border.activeColor};
}

/** Создаёт настройки отрисовки подписи колонки по конфигу. */
export function createColumnLabelDrawSettings(config: CaratDrawerConfig): CaratColumnLabelDrawSettings {
  const { font, color, marginTop } = config.column.label;
  const height = font.size + marginTop;
  return {font: getFont(font, config.stage.font), color, height};
}

/** Создаёт настройки отрисовки вертикальной оси колонки по конфигу. */
export function createColumnYAxisDrawSettings(config: CaratDrawerConfig): CaratColumnYAxisDrawSettings {
  const { font, color, markSize, grid } = config.column.axis.vertical;
  return {
    font: getFont(font, config.stage.font), color, markSize,
    gridThickness: grid.thickness, gridLineDash: grid.lineDash,
  };
}

/** Создаёт настройки отрисовки горизонтальных осей колонки по конфигу. */
export function createColumnXAxesDrawSettings(config: CaratDrawerConfig): CaratColumnXAxesDrawSettings {
  const { font, thickness, markSize, gap, grid } = config.column.axis.horizontal;
  const axisHeight = font.size + 3 * thickness;

  return {
    font: getFont(font, config.stage.font),
    thickness, markSize, gap, axisHeight,
    gridThickness: grid.thickness, gridLineDash: grid.lineDash
  };
}

/** Создаёт настройки отрисовки корреляций по конфигу. */
export function createCorrelationDrawSettings(config: CaratDrawerConfig): CaratCorrelationDrawSettings {
  return {thickness: config.correlation.thickness};
}

/** Преобразует модель шрифта в `canvas.font`. */
function getFont(font: Partial<CSSFont>, defaultFont: CSSFont) {
  const style = font.style ?? defaultFont.style;
  const size = font.size ?? defaultFont.size;
  const family = font.family ?? defaultFont.family;
  return `${style} ${size}px ${family}`;
}
