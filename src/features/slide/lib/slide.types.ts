import type { CSSProperties } from 'react';


/** Дерево элементов слайд формы. */
export type SlideTree = SlideElement[];

/** Элемент в дереве слайд-формы. */
export interface SlideElement {
  /** ID элемента. */
  readonly id: SlideElementID;
  /** ID родительского элемента. */
  readonly parent: SlideElementID;
  /** Тип элемента. */
  readonly type: SlideElementType;
  /** Заголовок элемента. */
  readonly title?: string;
  /** Значение элемента в зависимости от типа. */
  readonly payload?: string;
  /** Кастомный стиль элемента. */
  readonly style?: CSSProperties;
  /** Дочерние элементы. */
  children?: SlideElement[];
}
