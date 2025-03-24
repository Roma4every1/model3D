import type { IJsonModel } from 'flexlayout-react';
import type { XRawElement } from 'shared/lib';
import type { TableSettingsDTO } from 'features/table';
import type { CaratFormSettings } from 'features/carat';

import { useClientStore } from 'entities/client';
import { useParameterStore, serializeParameter, ParameterStringTemplate } from 'entities/parameter';
import { useTableStore, tableStateToSettings } from 'features/table';
import { useCaratStore, caratStateToSettings } from 'features/carat';
import { useChartStore, chartStateToSettings, chartStateToExtra } from 'features/chart';


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
  tables: TableSettingsDTO[];
  /** Настройки каротажных диаграмм (тип `carat`). */
  carats: CaratFormSettings[];
}


/** Конвертирует состояние приложения в модель сохраняемой сессии. */
export function getSessionToSave(version: string): SessionToSave {
  if (version && version > '3.7.22') {
    return Object.values(useClientStore.getState()).map(toClientDTO) as any;
  }
  const clients = useClientStore.getState();
  const presentations = Object.values(clients).filter(c => c.type === 'grid' && c.children);

  return {
    parameters: getParametersToSave(),
    children: getChildrenToSave(clients.root, presentations),
    layout: getLayoutsToSave(clients.root, presentations),
    settings: getSettingsToSave(),
  };
}

/* --- New Format --- */

function toClientDTO(client: SessionClient): any {
  const { id, type } = client;
  const pStorage = useParameterStore.getState().storage;
  const parameters = client.parameters?.map(id => serializeParameter(pStorage.get(id)));

  const children = getClientChildrenToSave(client);
  const layout = id === 'root' ? getRootLayout(client) : client.layout?.toJson();

  let settings: Record<string, any>;
  let extra: XRawElement;

  if (type === 'dataSet') {
    settings = tableStateToSettings(id, useTableStore.getState()[id]);
  } else if (type === 'chart') {
    const state = useChartStore.getState()[id];
    settings = chartStateToSettings(state);
    extra = chartStateToExtra(state);
  } else if (type === 'carat') {
    settings = caratStateToSettings(id, useCaratStore.getState()[id]);
  }
  return {id, type, children, parameters, layout, settings, extra};
}

function getClientChildrenToSave(client: SessionClient): ChildrenToSave {
  if (client.type === 'grid') {
    if (!client.children || client.settings.multiMapChannel) return undefined;
    return toChildrenToSave(client);
  }
  if (client.id === 'root') {
    return {
      id: client.id,
      children: client.children.map(toFormDataWM),
      openedChildren: [client.activeChildID],
      activeChildren: [client.activeChildID],
    };
  }
  return undefined;
}

/* --- Parameters --- */

function getParametersToSave(): ParametersToSave[] {
  const parameters: ParametersToSave[] = [];
  const dict: ParameterDict = useParameterStore.getState().clients;

  for (const id in dict) {
    const value = dict[id].map(serializeParameter);
    parameters.push({id, value});
  }
  return parameters;
}

/* --- Children --- */

function getChildrenToSave(root: SessionClient, presentations: SessionClient[]): ChildrenToSave[] {
  const children = presentations
    .filter(p => !p.settings.multiMapChannel)
    .map(toChildrenToSave);

  children.push({
    id: root.id,
    children: root.children.map(toFormDataWM),
    openedChildren: [root.activeChildID],
    activeChildren: [root.activeChildID],
  });
  return children;
}

function toChildrenToSave(state: SessionClient): ChildrenToSave {
  return {
    id: state.id,
    children: state.children.map(toFormDataWM),
    openedChildren: [...state.openedChildren],
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

  const tables: TableSettingsDTO[] = [];
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

function getLayoutsToSave(root: SessionClient, presentations: SessionClient[]): LayoutToSave[] {
  const layoutArray: LayoutToSave[] = [getRootLayout(root)];
  for (const presentation of presentations) {
    const layout = presentation.layout.toJson();
    layoutArray.push({...layout, id: presentation.id});
  }
  return layoutArray;
}

function getRootLayout(root: SessionClient): LayoutToSave {
  const result = root.layout.left.model.toJson();
  const { topBorder, rightBorder, model } = root.layout.controller;

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
