import { Model, IJsonModel } from 'flexlayout-react';
import { IGlobalAttributes } from 'flexlayout-react/declarations/model/IJsonModel';
import { IJsonTabNode, IJsonTabSetNode } from 'flexlayout-react/declarations/model/IJsonModel';
import { measureText } from 'shared/lib';


/** Высота заголовка в элементе TabSet. */
const TAB_STRIP_HEIGHT = 26;   // px
/** Ширина элемента с названием параметра. */
const PARAM_LABEL_WIDTH = 110; // px


const globalAttributes: IGlobalAttributes = {
  rootOrientationVertical: true,
  tabSetTabStripHeight: TAB_STRIP_HEIGHT,
  borderEnableDrop: false,
  splitterSize: 6,
  tabEnableRename: false,
  tabEnableClose: false,
  tabEnableDrag: false,
};

/** Вкладка с глобальными параметрами. */
const globalParamsTab: [IJsonTabNode] = [
  {type: 'tab', name: 'Глобальные параметры', component: 'global'},
];
/** Вкладка с параметрами презентации. */
const presentationParamsTab: [IJsonTabNode] = [
  {type: 'tab', name: 'Параметры презентации', component: 'form'},
];
/** Вкладка со списком презентаций: `<PresentationList/>`. */
const presentationListTab: [IJsonTabNode] = [
  {type: 'tab', name: 'Презентации', component: 'tree'},
];

/** Возвращает разметку для левой панели (с параметрами).
 * @param proto прототип разметки
 * @param globalParams глобальные параметров
 * @param formParams параметры текущей презентации
 * */
export function getLeftPanelLayout(
  proto: LeftPanelLayout,
  globalParams: FormParameter[], formParams: FormParameter[],
): Model {
  const children: IJsonTabSetNode[] = [];
  const { globalParamsHeight, formParamsHeight, treeHeight } = proto;

  const globalParamsNumber = globalParams?.filter(p => p.editorType).length;
  const formParamsNumber = formParams?.filter(p => p.editorType).length;

  if (globalParamsHeight > 0 && globalParamsNumber > 0) {
    const height = globalParamsHeight === 1
      ? getParamsListHeight(globalParams)
      : globalParamsHeight;

    children.push({
      type: 'tabset', id: 'globalParamsHeight', height, minHeight: height / 2,
      children: globalParamsTab,
    });
  }

  if (formParamsHeight > 0 && formParamsNumber > 0) {
    const height = formParamsHeight === 1
      ? getParamsListHeight(formParams)
      : formParamsHeight;

    children.push({
      type: 'tabset', id: 'formParamsHeight', height, minHeight: height / 2,
      children: presentationParamsTab,
    });
  }

  if (treeHeight > 0) {
    children.push({
      type: 'tabset', id: 'treeHeight', minHeight: 50,
      children: presentationListTab,
    });
  }

  const layout: IJsonModel = {global: globalAttributes, layout: {type: 'row', children}};
  return Model.fromJson(layout);
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

/** Количество строк, требуемых для отрисовки текста. */
function getLinesCount(text: string): number {
  const wordsWidth = text.split(' ').map(measureText);
  let lines = 1, sum = 0;
  for (const width of wordsWidth) {
    if (sum + width < PARAM_LABEL_WIDTH) { sum += width; continue; }
    lines += 1; sum = width;
  }
  return lines;
}
