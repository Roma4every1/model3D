import { Model } from 'flexlayout-react';
import { setUnion, leftAntiJoin } from 'shared/lib';
import { fillPatterns } from 'shared/drawing';
import { ParameterStringTemplate } from 'entities/parameter';
import { createChannels, getExternalChannels, getLinkedChannels, getLookupChannels } from 'entities/channel';
import { clientAPI } from 'entities/client';
import { handleLayout } from './layout';
import { getChildrenTypes } from './utils';


/** Создаёт состояние презентации. */
export async function createPresentationState(id: ClientID): Promise<[PresentationState, Parameter[], AttachedChannel[]]> {
  const { ok, data } = await clientAPI.getClientData(id, 'grid');
  if (!ok) return [null, null, null];

  const { settings, channels, children: childrenRaw, layout, parameters } = data;
  if (!settings.linkedProperties) settings.linkedProperties = [];

  const { children, openedChildren, activeChildren } = childrenRaw;
  const types = getChildrenTypes(children, openedChildren);

  for (const child of children) {
    const pattern = child.displayNameString;
    if (pattern) child.displayNameString = new ParameterStringTemplate(pattern);
  }
  if (types.has('map') || types.has('carat') || types.has('profile')) {
    await fillPatterns.initialize();
  }

  const state: PresentationState = {
    id, settings, layout: Model.fromJson(handleLayout(layout, children, activeChildren[0])),
    children, openedChildren, activeChildID: activeChildren[0], childrenTypes: types,
  };
  return [state, parameters, channels];
}

export async function createPresentationChildren(id: ClientID, children: FormDataWM[]): Promise<ClientStates> {
  const childStates: ClientStates = {};

  await Promise.all(children.map(async (data: FormDataWM): Promise<void> => {
    const childID = data.id;
    const { ok, data: dto } = await clientAPI.getClientData(childID, data.type);
    if (!ok) return;

    const { channels, settings } = dto;
    childStates[childID] = {id: childID, type: data.type, parent: id, channels, settings};
  }));
  return childStates;
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
 * @param parameters параметры клиента
 * @param existing список уже существующих каналов
 * */
export async function createClientChannels(
  set: Set<ChannelName>, parameters: Parameter[], existing: ChannelName[]
): Promise<ChannelDict> {
  const externalSet = getExternalChannels(parameters);

  const baseNames = [...leftAntiJoin(setUnion(set, externalSet), existing)];
  const baseChannels = await createChannels(baseNames);
  existing.push(...baseNames);

  const linkedSet = getLinkedChannels(baseChannels);
  const linkedNames = [...leftAntiJoin(linkedSet, existing)];
  const linkedChannels = await createChannels(linkedNames);
  existing.push(...linkedNames);

  const lookupSet = getLookupChannels({...baseChannels, ...linkedChannels});
  const lookupNames = [...leftAntiJoin(lookupSet, existing)];
  const lookupChannels = await createChannels(lookupNames);

  // наполнение канала для параметра должно зависеть от серверной конфигурации:
  // клиент не должен переопределять ограничение записей
  for (const name of externalSet) {
    const channel = baseChannels[name];
    if (channel) channel.query.limit = null;
  }
  return {...baseChannels, ...linkedChannels, ...lookupChannels};
}
