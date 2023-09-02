import { Model } from 'flexlayout-react';
import { setUnion, leftAntiJoin } from 'shared/lib';
import { createChannels } from 'entities/channels';
import { getExternalChannels, getLinkedChannels, getLookupChannels } from 'entities/channels';
import { handleLayout } from './layout';
import { applyDisplayNamePattern } from './display-name-string';
import { getChildrenTypes } from './utils';
import { fillPatterns } from 'shared/drawing';
import { formsAPI } from 'widgets/presentation/lib/forms.api';


/** Создаёт состояние презентации. */
export async function createPresentationState(id: ClientID): Promise<PresentationState> {
  const [resSettings, resChildren, resLayout] = await Promise.all([
    formsAPI.getFormSettings(id),
    formsAPI.getClientChildren(id),
    formsAPI.getPresentationLayout(id),
  ]);

  if (!resChildren.ok) return;
  const { children, openedChildren, activeChildren } = resChildren.data;
  children.forEach(applyDisplayNamePattern);

  const settings = resSettings.ok
    ? resSettings.data as GridFormSettings
    : {multiMapChannel: null, parametersGroups: null};
  const layout = handleLayout(resLayout, children, activeChildren[0]);

  return {
    id, settings, layout: Model.fromJson(layout), children,
    openedChildren, activeChildID: activeChildren[0],
    childrenTypes: getChildrenTypes(children, openedChildren),
  };
}

/** Создаёт все необходимые каналы для клиента.
 *
 * Итоговый список каналов состоит из:
 * + базовых каналов (передаётся)
 * + каналов для параметров
 * + привязанных каналов
 * + каналов-справочников
 *
 * @param set базовый набор каналов
 * @param dict параметры клиента
 * @param existing список уже существующих каналов
 * */
export async function createClientChannels(
  set: Set<ChannelName>, dict: ParamDict, existing: ChannelName[]
): Promise<ChannelDict> {
  const clientParams: Parameter[] = [];
  Object.values(dict).forEach((params) => { clientParams.push(...params); });
  const externalSet = getExternalChannels(clientParams);

  const baseNames = [...leftAntiJoin(setUnion(set, externalSet), existing)];
  const baseChannels = await createChannels(baseNames);
  existing = existing.concat(baseNames);

  const linkedSet = getLinkedChannels(baseChannels);
  const linkedNames = [...leftAntiJoin(linkedSet, existing)];
  const linkedChannels = await createChannels(linkedNames);
  existing = existing.concat(linkedNames);

  const lookupSet = getLookupChannels({...baseChannels, ...linkedChannels});
  const lookupNames = [...leftAntiJoin(lookupSet, existing)];
  const lookupChannels = await createChannels(lookupNames);

  return {...baseChannels, ...linkedChannels, ...lookupChannels};
}

/**
 * Запрашивает каналы презентации и всех дочерних форм.
 * Возвращает полный список всех каналов без повторений и словарь по формам.
 * */
export async function getPresentationChannels(id: ClientID, ids: FormID[]) {
  const parentNames = await formsAPI.getClientAttachedChannels(id);
  const attachments = await Promise.all(ids.map((id) => formsAPI.getClientAttachedChannels(id)));

  const dict = {};
  const all = new Set(parentNames.map(c => c.name));

  attachments.forEach((attachedChannels, i) => {
    dict[ids[i]] = attachedChannels;
    for (const name of attachedChannels) all.add(name.name);
  });
  return [all, dict] as [Set<ChannelName>, Record<FormID, AttachedChannel[]>];
}

export async function createFormStates(
  parent: ClientID, data: FormDataWM[],
  channels: Record<FormID, AttachedChannel[]>
) {
  const states: FormStates = {};
  const settingsArray = await Promise.all(data.map(createFormSettings));

  data.forEach(({id, type}, i) => {
    states[id] = {id, type, parent, channels: channels[id], settings: settingsArray[i]};
  });
  return states;
}

async function createFormSettings({id, type}: FormDataWM): Promise<FormSettings> {
  if (type === 'dataSet' || type === 'carat' || type === 'chart') {
    const res = await formsAPI.getFormSettings(id);
    if (type === 'carat') await fillPatterns.initialize();
    if (!res.ok) return {};
    return res.data;
  }
  if (type === 'map') await fillPatterns.initialize();
  return {};
}
