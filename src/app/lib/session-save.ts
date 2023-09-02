import { IJsonModel } from 'flexlayout-react';
import { serializeParameter } from 'entities/parameters';
import { TableFormSettings, tableStateToSettings } from 'features/table';
import { caratStateToSettings } from 'features/carat';


/** Модель, используемая в серверных запросах для сохранения сессии. */
export interface SessionToSave {
  /** ID сохраняемой сессии. */
  sessionId: SessionID;
  /** Параметры главной формы и презентаций. */
  parameters: ParametersToSave;
  /** Состояние дочерних форм презентаций. */
  children: FormChildrenState[];
  /** Разметка презентаций. */
  layout: LayoutsToSave;
  /** Настройки форм по типам. */
  settings: SessionSettings;
}

/** Хранилище настроек форм по типам. */
interface SessionSettings {
  /** Настройки таблиц (тип `dataSet`). */
  tables: TableFormSettings[];
  /** Настройки каротажных диаграмм (тип `carat`). */
  carats: CaratFormSettings[];
}

/** Массив с данными о параметрах главной формы и презентаций. */
type ParametersToSave = {id: ClientID, value: SerializedParameter[]}[];
/** Массив с данными о разметке презентаций. */
type LayoutsToSave = ({id: ClientID} & IJsonModel)[];


/** Конвертирует состояние приложения в модель сохраняемой сессии. */
export function getSessionToSave(state: WState): SessionToSave {
  return {
    sessionId: state.appState.sessionID,
    parameters: getParametersToSave(state.parameters),
    children: getChildrenToSave(state.root, state.presentations),
    layout: getLayoutsToSave(state.root, state.presentations),
    settings: getSettingsToSave(state.tables, state.carats),
  };
}

/* --- Parameters --- */

function getParametersToSave(formParams: ParamDict): ParametersToSave {
  const parameters: ParametersToSave = [];
  for (const id in formParams) {
    const value = formParams[id].map(serializeParameter);
    parameters.push({id, value});
  }
  return parameters;
}

/* --- Children --- */

function getChildrenToSave(root: RootFormState, presentations: PresentationDict): FormChildrenState[] {
  const childArray = Object.values(presentations)
    .filter(p => !p.settings.multiMapChannel)
    .map(presentationStateToChildren);

  childArray.push({
    id: root.id,
    children: root.children,
    openedChildren: [root.activeChildID],
    activeChildren: [root.activeChildID],
  });
  return childArray;
}

function presentationStateToChildren(state: PresentationState): FormChildrenState {
  return {
    id: state.id,
    children: state.children,
    openedChildren: state.openedChildren,
    activeChildren: state.activeChildID ? [state.activeChildID] : [],
  };
}

/* --- Settings --- */

function getSettingsToSave(tableStates: TableStates, caratsState: CaratStates): SessionSettings {
  const tables: TableFormSettings[] = [];
  const carats: CaratFormSettings[] = [];

  for (const id in tableStates) {
    const tableState = tableStates[id];
    tables.push(tableStateToSettings(id, tableState));
  }
  for (const id in caratsState) {
    const caratState = caratsState[id];
    carats.push(caratStateToSettings(id, caratState));
  }
  return {tables, carats};
}

/* --- Layout --- */

function getLayoutsToSave(root: RootFormState, presentations: PresentationDict): LayoutsToSave {
  const layoutArray: LayoutsToSave = [getRootLayout(root)];
  for (const id in presentations) {
    const layout = presentations[id].layout.toJson();
    layoutArray.push({...layout, id});
  }
  return layoutArray;
}

function getRootLayout(root: RootFormState): any {
  const { common, left } = root.layout;
  const model = left.model.toJson();

  model.id = root.id;
  model.layout = {
    ...model.layout,
    sizeleft: common.leftPanelWidth,
    sizeright: common.rightPanelWidth,
    selectedtop: common.selectedTopTab,
    selectedleft: 0,
    selectedright: common.selectedRightTab
  };
  return model;
}
