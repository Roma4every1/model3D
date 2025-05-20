import type { CSSProperties } from 'react';


/** Дерево элементов слайд формы. */
export type SlideTree = SlideElement[];

/** Элемент в дереве слайд-формы. */
export interface SlideElement<T extends SlideElementType = SlideElementType, P = any> {
  /** ID элемента. */
  readonly id: SlideElementID;
  /** ID родительского элемента. */
  readonly parent: SlideElementID;
  /** Тип элемента. */
  readonly type: T;
  /** Заголовок элемента. */
  readonly title?: string;
  /** Значение элемента в зависимости от типа. */
  readonly payload?: P;
  /** Кастомный стиль элемента. */
  readonly style?: CSSProperties;
  /** Дочерние элементы. */
  children?: SlideElement[];
}

/** Слайд элемент типа "кнопка". */
export type SlideButtonElement = SlideElement<'button', SlideButtonPayload>;

/** Полезная нагрузка для элемента кнопки. */
export interface SlideButtonPayload {
  /** ID программы, с которой связана кнопка. */
  readonly program: ProgramID;
  /** Значения параметров, которые нужно установить перед запуском. */
  readonly values?: Record<ParameterName, string>;
}
