import { setUnion, leftAntiJoin } from 'shared/lib';
import { fillPatterns } from 'shared/drawing';
import { ParameterStringTemplate, getParameterChannels } from 'entities/parameter';
import { createChannels, getDetailChannels, getLookupChannels } from 'entities/channel';
import { AttachedChannelFactory, clientAPI } from 'entities/client';
import { multiMapChannelCriterion } from 'features/multi-map';
import { LayoutFactory } from './layout';
import { getChildrenTypes } from './utils';


/** Создаёт состояние презентации. */
export async function createPresentationState(id: ClientID): Promise<[PresentationState, Parameter[], AttachedChannelDTO[]]> {
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
    id, settings, channels: [],
    layout: new LayoutFactory(children, activeChildren[0]).create(layout),
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

    const settings = dto.settings;
    const channels = dto.channels as any[];
    childStates[childID] = {id: childID, type: data.type, parent: id, channels, settings};
  }));
  return childStates;
}

export function createAttachedChannels(
  state: PresentationState, attached: AttachedChannelDTO[], all: ChannelDict,
): AttachedChannel[] {
  if (!state.settings.multiMapChannel) return [];
  const criteria = {multiMap: multiMapChannelCriterion};
  const factory = new AttachedChannelFactory(all, criteria);

  const channels = factory.create(attached);
  if (!channels.some(c => c.type === 'multiMap')) delete state.settings.multiMapChannel;
  return channels;
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
  const externalSet = getParameterChannels(parameters);

  const baseNames = [...leftAntiJoin(setUnion(set, externalSet), existing)];
  const baseChannels = await createChannels(baseNames);
  existing.push(...baseNames);

  const linkedSet = getDetailChannels(baseChannels);
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
