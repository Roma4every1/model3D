/** Элемент ствола скважины. */
export interface WellBoreElementModel {
  /** Начальная глубина элемента. */
  top: number;
  /** Конечная глубина элемента. */
  bottom: number;
  /** Внутренний диаметр ствола. */
  innerDiameter: number;
  /** Внешний диаметр ствола. */
  outerDiameter: number;
  /** Глубина начала цементирования (конец = bottom). */
  cement: number;
  /** Подпись элемента конструкции. */
  label: string;
}

/** Настройки внешнего вида элементов ствола. */
export interface WellBoreElementStyle {
  /** Цвет заливки прямоугольника для внутреннего диаметра. */
  innerColor: ColorString;
  /** Цвет заливки прямоугольника для внешнего диаметра. */
  outerColor: ColorString;
  /** Цвет заливки цементажа. */
  cementColor: ColorString;
}

/** Элемент конструкции скважины в виде картинки. */
export interface CaratImageModel {
  /** Координата начала. */
  top: number;
  /** Координата конца. */
  bottom: number;
  /** Изображение. */
  image: HTMLImageElement;
  /** Подпись. */
  label: string;
}

/** Забой скважины; относится к элементам конструкции. */
export interface CaratWellFaceModel {
  top: number;
  bottom: number;
  diameter: number;
  style: ShapeStyle;
  label: string;
}

/** Элемент конструкции скважины в виде вертикальной прямой. */
export interface CaratVerticalLineModel {
  /** Координата начала линии. */
  top: number;
  /** Координата конца линии. */
  bottom: number;
  /** Ширина линии. */
  width: number;
}

/** Подпись к элементу конструкции скважины. */
export interface ConstructionLabel {
  /** Координата подписи по Y. */
  y: number;
  /** Смещение по X линии к подписи относительно центра колонки элемента. */
  shift: number;
  /** Текст подписи. */
  text: string;
  /** Строки текста. */
  lines: string[];
}
