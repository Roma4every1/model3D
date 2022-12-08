import { IJsonModel } from "flexlayout-react";
import { IJsonTabSetNode } from "flexlayout-react/declarations/model/IJsonModel";


/** Перечисление для элементов боковой панели. */
export enum LeftPanelItems {
  /** Глобальные параметры (параметры корневой формы). */
  GLOBAL = 'g',
  /** Параметры текущей презентации. */
  FORM = 'f',
  /** Список презентаций. */
  LIST = 'l',
}

/** Высота заголовка в элементе TabSet. */
const TAB_STRIP_HEIGHT = 28;   // px
/** Ширина элемента с названием параметра. */
const PARAM_LABEL_WIDTH = 110; // px

/** Возвращает разметку для левой панели (с параметрами).
 * @param proto прототип разметки
 * @param globalParams глобальные параметров
 * @param formParams параметры текущей презентации
 * */
export function getLeftPanelLayout(proto: LeftPanelItems[], globalParams: FormParameter[], formParams: FormParameter[]): IJsonModel {
  const globalParamsNumber = globalParams?.filter(p => p.editorType).length;
  const isShowGlobal = proto.includes(LeftPanelItems.GLOBAL) && globalParamsNumber > 0;

  const formParamsNumber = formParams?.filter(p => p.editorType).length;
  const isShowForm = proto.includes(LeftPanelItems.FORM) && formParamsNumber > 0;

  const children: IJsonTabSetNode[] = [];

  if (proto.includes(LeftPanelItems.LIST)) {
    children.unshift({
      type: 'tabset', minHeight: 50,
      children: [{type: 'tab', name: 'Презентации', component: LeftPanelItems.LIST, enableDrag: true}],
    });
  }

  if (isShowForm) {
    const height = getParamsListHeight(formParams);
    children.unshift({
      type: 'tabset', height, minHeight: height / 2,
      children: [{
        type: 'tab', name: 'Параметры презентации',
        component: LeftPanelItems.FORM, enableDrag: true,
      }],
    });
  }

  if (isShowGlobal) {
    const height = getParamsListHeight(globalParams);
    children.unshift({
      type: 'tabset',
      height, minHeight: height / 2,
      children: [{
        type: 'tab', name: 'Глобальные параметры',
        component: LeftPanelItems.GLOBAL, enableDrag: true,
      }],
    });
  }

  return {
    global: {
      rootOrientationVertical: true,
      borderEnableDrop: false,
      tabEnableRename: false,
      tabSetTabStripHeight: TAB_STRIP_HEIGHT,
      tabEnableClose: false,
      splitterSize: 6,
    },
    layout: {type: 'row', children}
  };
}

/** Вычисляет высоту компонента вкладки `ParametersList` по набору параметров. */
function getParamsListHeight(params: FormParameter[]): number {
  let height = TAB_STRIP_HEIGHT;
  for (const param of params) {
    if (!param.editorType) continue;

    const editorH = param.editorType === 'dateIntervalTextEditor' ? 40 : 20;
    const textH = 12 * 1.2 * getLinesCount(param.displayName);
    height += Math.max(textH, editorH) + 5;
  }
  return height + 2;
}

/* --- Common Layout Utils --- */

function getLinesCount(text: string) {
  const wordsWidth = text.split(' ').map(textWidth);
  let lines = 1, sum = 0;
  for (const width of wordsWidth) {
    if (sum + width < PARAM_LABEL_WIDTH) { sum += width; continue; }
    lines += 1; sum = width;
  }
  return lines;
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.font = 'normal 12px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Segoe UI Symbol"';

export function textWidth(text: string): number {
  return Math.ceil(ctx.measureText(text).width);
}
