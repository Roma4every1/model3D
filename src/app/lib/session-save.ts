import type { XRawElement } from 'shared/lib';
import { useClientStore } from 'entities/client';
import { useParameterStore, serializeParameter, ParameterStringTemplate } from 'entities/parameter';
import { useTableStore, tableStateToSettings } from 'features/table';
import { useCaratStore, caratStateToSettings, caratStateToExtra } from 'features/carat';
import { useChartStore, chartStateToSettings, chartStateToExtra } from 'features/chart';
import { serializeAppLayout } from './layout';
import { serializePresentationLayout } from 'widgets/presentation';


/** Модель, используемая в серверных запросах для сохранения сессии. */
export type SessionToSave = SessionClientToSave[];

/** Данные клиента сессии для сохранения. */
interface SessionClientToSave {
  /** ID клиента сессии. */
  readonly id: ClientID;
  /** Тип клиента сессии. */
  readonly type: ClientType;
  /** Дочерние клиенты (только для dock и grid). */
  readonly children?: ChildrenToSave;
  /** Параметры (только для dock и grid). */
  readonly parameters?: SerializedParameter[];
  /** Разметка (только для dock и grid). */
  readonly layout?: XRawElement;
  /** Настройки (только для dataSet, carat, chart). */
  readonly settings?: Record<string, any>;
  /** Данные из тега extra. */
  readonly extra?: XRawElement;
}
/** DTO дочерних элементов и привязка по ID. */
type ChildrenToSave = ClientChildrenDTO & {id: ClientID};

/** Конвертирует состояние приложения в модель сохраняемой сессии. */
export function getSessionToSave(): SessionToSave {
  const clients = useClientStore.getState();
  return Object.values(clients).map(toClientDTO);
}

function toClientDTO(client: SessionClient): SessionClientToSave {
  const { id, type } = client;
  const pStorage = useParameterStore.getState().storage;
  const parameters = client.parameters?.map(id => serializeParameter(pStorage.get(id)));

  const children = getClientChildrenToSave(client);
  const layout = getClientLayoutToSave(client);

  let settings: Record<string, any>;
  let extra: XRawElement;

  if (type === 'dataSet') {
    settings = tableStateToSettings(id, useTableStore.getState()[id]);
  } else if (type === 'chart') {
    const state = useChartStore.getState()[id];
    settings = chartStateToSettings(state);
    extra = chartStateToExtra(state);
  } else if (type === 'carat') {
    const state = useCaratStore.getState()[id];
    settings = caratStateToSettings(id, state);
    extra = caratStateToExtra(state);
  }
  return {id, type, children, parameters, layout, settings, extra};
}

function getClientChildrenToSave(client: SessionClient): ChildrenToSave {
  if (client.type === 'grid') {
    if (!client.children || client.settings.mapLayoutManager) return undefined;
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

function getClientLayoutToSave(client: SessionClient): XRawElement {
  if (client.id === 'root') {
    return serializeAppLayout(client.layout);
  }
  if (client.layout && client.children && !client.settings.mapLayoutManager) {
    return serializePresentationLayout(client.layout);
  }
  return undefined;
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
