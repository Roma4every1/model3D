import type { IJsonModel } from 'flexlayout-react';
import type { TableFormSettings } from 'features/table';

import { useRootStore } from '../store/root-form.store';
import { usePresentationStore } from 'widgets/presentation';
import { useParameterStore, serializeParameter, ParameterStringTemplate } from 'entities/parameter';
import { useTableStore, tableStateToSettings } from 'features/table';
import { useCaratStore, caratStateToSettings } from 'features/carat';


/** Модель, используемая в серверных запросах для сохранения сессии. */
export interface SessionToSave {
  /** Параметры главной формы и презентаций. */
  parameters: ParametersToSave[];
  /** Состояние дочерних форм презентаций. */
  children: ChildrenToSave[];
  /** Разметка презентаций. */
  layout: LayoutToSave[];
  /** Настройки форм по типам. */
  settings: SettingsToSave;
}

/** Массив с данными о параметрах главной формы и презентаций. */
type ParametersToSave = {id: ClientID, value: SerializedParameter[]};
/** Массив с данными о дочерних клиентах главной формы и презентаций. */
type ChildrenToSave = ClientChildrenDTO & {id: ClientID};
/** Массив с данными о разметке презентаций. */
type LayoutToSave = IJsonModel & {id: ClientID};

/** Настройки форм по типам. */
interface SettingsToSave {
  /** Настройки таблиц (тип `dataSet`). */
  tables: TableFormSettings[];
  /** Настройки каротажных диаграмм (тип `carat`). */
  carats: CaratFormSettings[];
}


/** Конвертирует состояние приложения в модель сохраняемой сессии. */
export function getSessionToSave(): SessionToSave {
  const rootState = useRootStore.getState();
  const presentations = usePresentationStore.getState();

  return {
    parameters: getParametersToSave(),
    children: getChildrenToSave(rootState, presentations),
    layout: getLayoutsToSave(rootState, presentations),
    settings: getSettingsToSave(),
  };
}

/* --- Parameters --- */

function getParametersToSave(): ParametersToSave[] {
  const state = useParameterStore.getState();
  const parameters: ParametersToSave[] = [];

  for (const id in state) {
    const value = state[id].map(serializeParameter);
    parameters.push({id, value});
  }
  return parameters;
}

/* --- Children --- */

function getChildrenToSave(root: RootFormState, presentations: PresentationDict): ChildrenToSave[] {
  const childArray = Object.values(presentations)
    .filter(p => !p.settings.multiMapChannel)
    .map(toChildrenToSave);

  childArray.push({
    id: root.id,
    children: root.children.map(toFormDataWM),
    openedChildren: [root.activeChildID],
    activeChildren: [root.activeChildID],
  });
  return childArray;
}

function toChildrenToSave(state: PresentationState): ChildrenToSave {
  return {
    id: state.id,
    children: state.children.map(toFormDataWM),
    openedChildren: state.openedChildren,
    activeChildren: state.activeChildID ? [state.activeChildID] : [],
  };
}
function toFormDataWM(child: FormDataWM): FormDataWM {
  const pattern: ParameterStringTemplate = child.displayNameString;
  return pattern ? {...child, displayNameString: pattern.source} : child;
}

/* --- Settings --- */

function getSettingsToSave(): SettingsToSave {
  const tableStates = useTableStore.getState();
  const caratStates = useCaratStore.getState();

  const tables: TableFormSettings[] = [];
  const carats: CaratFormSettings[] = [];

  for (const id in tableStates) {
    const tableState = tableStates[id];
    tables.push(tableStateToSettings(id, tableState));
  }
  for (const id in caratStates) {
    const caratState = caratStates[id];
    carats.push(caratStateToSettings(id, caratState));
  }
  return {tables, carats};
}

/* --- Layout --- */

function getLayoutsToSave(root: RootFormState, presentations: PresentationDict): LayoutToSave[] {
  const layoutArray: LayoutToSave[] = [getRootLayout(root)];
  for (const id in presentations) {
    const layout = presentations[id].layout.toJson();
    layoutArray.push({...layout, id});
  }
  return layoutArray;
}

function getRootLayout(root: RootFormState): LayoutToSave {
  const result = root.layout.left.model.toJson();
  const { topBorder, rightBorder, model } = root.layout.common;

  result.id = root.id;
  result.layout = {
    ...result.layout,
    sizeleft: model.getNodeById('left').getRect().width,
    sizeright: rightBorder.getSize(),
    selectedtop: topBorder.getSelected(),
    selectedright: rightBorder.getSelected(),
    selectedleft: 0,
  };
  return result;
}
