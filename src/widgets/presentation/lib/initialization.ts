import { setUnion, leftAntiJoin } from 'shared/lib';
import { createChannels, applyLookupColumnNames } from 'entities/channels';
import { addExternalChannels, addLinkedChannels } from 'entities/channels';
import { handleLayout } from './layout';
import { applyDisplayNamePattern } from './display-name-string';
import { formsAPI } from 'widgets/presentation/lib/forms.api';


/** Создаёт состояние презентации. */
export async function createPresentationState(id: FormID): Promise<PresentationState> {
  const [resSettings, resChildren, resLayout] = await Promise.all([
    formsAPI.getFormSettings(id),
    formsAPI.getFormChildren(id),
    formsAPI.getFormLayout(id),
  ]);

  if (!resChildren.ok) return;
  const { children: allChildren, openedChildren, activeChildren } = resChildren.data;
  const children = allChildren.filter((child) => openedChildren.includes(child.id));
  children.forEach(applyDisplayNamePattern);

  const settings = resSettings.ok
    ? resSettings.data as GridFormSettings
    : {multiMapChannel: null, parametersGroups: null};
  const layout = handleLayout(resLayout, children, activeChildren[0]);

  return {
    id, settings, layout, children,
    activeChildID: activeChildren[0],
    childrenTypes: new Set(children.map(child => child.type)),
    reports: [],
  };
}

export async function createClientChannels(set: Set<ChannelName>, dict: ParamDict, existing: ChannelName[]) {
  const externalSet: Set<ChannelName> = new Set();
  Object.values(dict).forEach((params) => addExternalChannels(params, externalSet));

  const names = [...leftAntiJoin(setUnion(set, externalSet), existing)];
  const channels = await createChannels(names);

  set = new Set();
  names.forEach((name) => addLinkedChannels(channels[name], set));

  const linkedNames = [...leftAntiJoin(set, existing.concat(names))];
  const linkedChannels = await createChannels(linkedNames);

  const allChannels: ChannelDict = {...channels, ...linkedChannels};
  Object.values(allChannels).forEach(applyLookupColumnNames);
  return allChannels;
}

/** Запрашивает параметры презентации и всех дочерних форм. */
export async function getPresentationParams(id: FormID, ids: FormID[]): Promise<ParamDict> {
  const params = await formsAPI.getFormParameters(id);
  const childrenParams = await Promise.all(ids.map((id) => formsAPI.getFormParameters(id)));

  const result = {[id]: params};
  childrenParams.forEach((childParams, i) => { result[ids[i]] = childParams; });
  return result;
}

/**
 * Запрашивает каналы презентации и всех дочерних форм.
 * Возвращает полный список всех каналов без повторений и словарь по формам.
 * */
export async function getPresentationChannels(id: FormID, ids: FormID[]) {
  const parentNames = await formsAPI.getFormChannelsList(id);
  const childrenNames = await Promise.all(ids.map((id) => formsAPI.getFormChannelsList(id)));

  const dict = {};
  const all = new Set(parentNames);

  childrenNames.forEach((childNames, i) => {
    dict[ids[i]] = childNames;
    for (const name of childNames) all.add(name);
  });
  return [all, dict] as [Set<ChannelName>, Record<FormID, ChannelName[]>];
}

export async function createFormStates(id: FormID, data: FormDataWMR[], channels: Record<FormID, ChannelName[]>) {
  const states: FormsState = {};
  const settingsArray = await Promise.all(data.map(createFormSettings));

  data.forEach(({ id, type }, i) => {
    states[id] = {id, type, parent: id, channels: channels[id], settings: settingsArray[i]};
  });
  return states;
}

async function createFormSettings({id, type}: FormDataWMR): Promise<FormSettings> {
  let settings: any = {};
  if (type === 'dataSet' || type === 'chart') {
    const res = await formsAPI.getFormSettings(id);
    if (res.ok) settings = res.data;
  }

  if (settings.seriesSettings) {
    const seriesSettingsKeys = Object.keys(settings.seriesSettings);
    const firstSeries = settings.seriesSettings[seriesSettingsKeys[0]];
    settings.dateStep = firstSeries?.dateStep === 'Month' ? 'month' : 'year';
    settings.tooltip = false;
  }
  return settings;
}
