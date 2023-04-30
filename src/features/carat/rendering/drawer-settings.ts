/** Настройки отрисовщика каротажа. */
export interface CaratDrawerConfig {
  /** Настройки отрисовки трека. */
  track: {
    /** Настройки тела трека. */
    body: {
      /** Величина отступов вокруг трека. */
      margin: number,
      /** Цвет и толщина рамки вокруг трека. */
      border: {color: ColorHEX, thickness: number},
    },
    /** Настройки шапки трека. */
    header: {
      /** Величина внутренних отступов шапки. */
      padding: number,
      /** Шрифт и цвет подписи внутри шапки. */
      text: {font: CSSFont, color: ColorHEX},
      /** Цвет и толщина рамки вокруг шапки. */
      border: {color: ColorHEX, thickness: number},
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
      font: CSSFont,
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
        font: CSSFont,
        /** Цвет горизонтальной пометки и подписи. */
        color: ColorHEX,
        /** Размер горизонтальной пометки. */
        markSize: number,
      },
      /** Настройки горизонтальных осей кривых. */
      horizontal: {
        /** {@link CSSFont} подписей. */
        font: CSSFont,
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
}

/** Настройки отрисовки тела трека. */
export interface CaratTrackBodyDrawSettings {
  /** Величина отступов вокруг трека. */
  readonly margin: number,
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
  /** Цвет рамки вокруг шапки. */
  readonly borderColor: ColorHEX,
  /** Толщина рамки вокруг шапки. */
  readonly borderThickness: number,
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

/** Создаёт настройки отрисовки трека по конфигу. */
export function createTrackBodyDrawSettings(config: CaratDrawerConfig): CaratTrackBodyDrawSettings {
  const { margin, border } = config.track.body;
  return {margin, borderColor: border.color, borderThickness: border.thickness};
}

/** Создаёт настройки отрисовки трека по конфигу. */
export function createTrackHeaderDrawSettings(config: CaratDrawerConfig): CaratTrackHeaderDrawSettings {
  const { padding, text, border } = config.track.header;
  const headerFontSize = text.font.size;

  return {
    height: headerFontSize + 2 * padding,
    padding: padding,
    font: `${text.font.style} ${headerFontSize}px ${text.font.family}`,
    color: text.color,
    borderColor: border.color,
    borderThickness: border.thickness,
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
  return {font: `${font.style} ${font.size}px ${font.family}`, color, height};
}

/** Создаёт настройки отрисовки вертикальной оси колонки по конфигу. */
export function createColumnYAxisDrawSettings(config: CaratDrawerConfig): CaratColumnYAxisDrawSettings {
  const { font, color, markSize } = config.column.axis.vertical;
  return {font: `${font.style} ${font.size}px ${font.family}`, color, markSize};
}

/** Создаёт настройки отрисовки горизонтальных осей колонки по конфигу. */
export function createColumnXAxesDrawSettings(config: CaratDrawerConfig): CaratColumnXAxesDrawSettings {
  const { font, thickness, markSize, gap, grid } = config.column.axis.horizontal;
  const axisHeight = font.size + 3 * thickness;

  return {
    font: `${font.style} ${font.size}px ${font.family}`,
    thickness, markSize, gap, axisHeight,
    gridThickness: grid.thickness, gridLineDash: grid.lineDash
  };
}
