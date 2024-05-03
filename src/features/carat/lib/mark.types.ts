/** Настройки отображения подписей по глубине (DTO). */
export interface CaratMarkSettingsDTO {
  /** Настройки отображения текста. */
  readonly text?: CaratMarkTextSettingsDTO;
  /** Настройки отображения линии. */
  readonly line?: CaratMarkLineSettingsDTO;
  /** Показывать ли линию. */
  readonly showLine?: boolean;
  /** Показывать ли отметку глубины. */
  readonly showDepth?: boolean;
}

/** Настройки отображения текста для подписи по глубине (DTO). */
export interface CaratMarkTextSettingsDTO {
  /** Выравнивание текста (`left`, `right`, `center`). */
  readonly align?: string;
  /** Размер шрифта в пикселях. */
  readonly fontSize?: number;
  /** Цвет текста. */
  readonly color?: string;
  /** Фон заливки. */
  readonly backgroundColor?: string;
  /** Цвет рамки. */
  readonly borderColor?: string;
}

/** Настройки отображения линии для подписи по глубине (DTO). */
export interface CaratMarkLineSettingsDTO {
  /** Цвет линии. */
  readonly color?: string;
  /** Толщина линии в пикселях. */
  readonly width?: number;
  /** Сегменты штриховки. */
  readonly dasharray?: string;
}

/* --- --- */

/** Подпись (заметка) по глубине. */
export interface CaratMarkModel {
  /** Значение глубины. */
  depth: number;
  /** Текст подписи. */
  text: string;
  /** Мемоизированное значение ширины текста. */
  textWidth: number;
}

/** Настройки отображения подписей по глубине. */
export type CaratMarkSettings = Omit<CaratMarkSettingsDTO, 'text' | 'line'> & {
  /** Настройки отображения текста. */
  readonly text: CaratMarkTextSettings;
  /** Настройки отображения линии. */
  readonly line: CaratMarkLineSettings;
}

/** Настройки отображения текста для подписи по глубине. */
export type CaratMarkTextSettings = Omit<CaratMarkTextSettingsDTO, 'align' | 'fontSize'> & {
  /** Выравнивание подписи. */
  readonly align: CanvasTextAlign;
  /** Численное значение для выравнивания. */
  readonly nAlign: NAlign;
  /** CSS-font строка. */
  readonly font: string;
  /** Размер шрифта в пикселях. */
  readonly fontSize: number;
}

/** Настройки отображения линии для подписи по глубине. */
export type CaratMarkLineSettings = Omit<CaratMarkLineSettingsDTO, 'dasharray'> & {
  /** Массив сегментов. */
  readonly dasharray: number[];
}
