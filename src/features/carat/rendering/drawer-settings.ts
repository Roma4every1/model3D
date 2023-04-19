import {CaratStage} from "./stage";

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
    /** Настройки подписей к колонкам. */
    label: {
      /** {@link CSSFont} подписи. */
      font: CSSFont,
      /** Цвет подписи. */
      color: ColorHEX,
      /** Горизонатльное выравнивание подписи. */
      align: CanvasTextAlign,
    },
    /** Настройки вертикальных осей. */
    verticalAxis: {
      /** {@link CSSFont} подписи. */
      font: CSSFont,
      /** Цвет горизонтальной пометки и подписи. */
      color: ColorHEX,
      /** Размер горизонтальной пометки в пикселях. */
      markSize: number,
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

/** Настройки отрисовки подписи колонки. */
export interface CaratColumnLabelDrawSettings {
  /** Шрифт подписи. */
  readonly font: string,
  /** Цвет подписи. */
  readonly color: ColorHEX,
  /** Горизонатльное выравнивание. */
  readonly align: CanvasTextAlign,
}

/** Настройки отрисовки вертикальной оси колонки. */
export interface CaratColumnYAxisDrawSettings {
  /** Шрифт подписей. */
  readonly font: string,
  /** Цвет подписей. */
  readonly color: ColorHEX,
  /** Размер горизонтальной черты в пикселях. */
  readonly markSize: number,
}


/** Создаёт настройки отрисовки трека по конфигу. */
export function createTrackBodyDrawSettings(config: CaratDrawerConfig): CaratTrackBodyDrawSettings {
  const { margin, border } = config.track.body;

  return {
    margin: CaratStage.ratio * margin,
    borderColor: border.color,
    borderThickness: CaratStage.ratio * border.thickness,
  };
}

/** Создаёт настройки отрисовки трека по конфигу. */
export function createTrackHeaderDrawSettings(config: CaratDrawerConfig): CaratTrackHeaderDrawSettings {
  const { padding, text, border } = config.track.header;
  const headerFontSize = CaratStage.ratio * text.font.size;

  return {
    height: headerFontSize + 2 * CaratStage.ratio * padding,
    padding: CaratStage.ratio * padding,
    font: `${text.font.style} ${headerFontSize}px ${text.font.family}`,
    color: text.color,
    borderColor: border.color,
    borderThickness: CaratStage.ratio * border.thickness,
  };
}

/** Создаёт настройки отрисовки колонки по конфигу. */
export function createColumnLabelDrawSettings(config: CaratDrawerConfig): CaratColumnLabelDrawSettings {
  const { font, color, align } = config.column.label;
  const labelFontSize = CaratStage.ratio * font.size;
  return {font: `${font.style} ${labelFontSize}px ${font.family}`, color, align};
}

/** Создаёт настройки отрисовки колонки по конфигу. */
export function createColumnYAxisDrawSettings(config: CaratDrawerConfig): CaratColumnYAxisDrawSettings {
  const { font, color, markSize } = config.column.verticalAxis;
  const axisFontSize = CaratStage.ratio * font.size;

  return {
    font: `${font.style} ${axisFontSize}px ${font.family}`,
    color: color,
    markSize: CaratStage.ratio * markSize,
  };
}
