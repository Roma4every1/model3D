import { setUnion, leftAntiJoin } from 'shared/lib';
import { createChannels } from 'entities/channels';
import { getExternalChannels, getLinkedChannels, getLookupChannels } from 'entities/channels';
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
  const { children, openedChildren, activeChildren } = resChildren.data;
  children.forEach(applyDisplayNamePattern);

  const settings = resSettings.ok
    ? resSettings.data as GridFormSettings
    : {multiMapChannel: null, parametersGroups: null};
  const layout = handleLayout(resLayout, children, activeChildren[0]);

  return {
    id, settings, layout, children,
    openedChildren, activeChildID: activeChildren[0],
    childrenTypes: new Set(children.map(child => child.type)),
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
export async function createClientChannels(set: Set<ChannelName>, dict: ParamDict, existing: ChannelName[]) {
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
    if (ids[i].endsWith('47d20d1d-bd04-4191-bf4e-f08032ae04fa'))
      childNames = ['stratums', 'Wells geometry', 'Litology', 'Perforations', 'Carottage curves'];
    dict[ids[i]] = childNames;
    for (const name of childNames) all.add(name);
  });
  return [all, dict] as [Set<ChannelName>, Record<FormID, ChannelName[]>];
}

export async function createFormStates(
  parent: FormID, data: FormDataWMR[],
  channels: Record<FormID, ChannelName[]>
) {
  const states: FormsState = {};
  const settingsArray = await Promise.all(data.map(createFormSettings));

  data.forEach(({id, type}, i) => {
    states[id] = {id, type, parent, channels: channels[id], settings: settingsArray[i]};
  });
  return states;
}

async function createFormSettings({id, type}: FormDataWMR): Promise<FormSettings> {
  if (type === 'dataSet') {
    const res = await formsAPI.getFormSettings(id);
    if (!res.ok) return {};
    const settings = res.data;

    const resPlugin = await formsAPI.getPluginData(id, 'tableColumnHeaderSetter');
    const rules: any[] = resPlugin.ok ? resPlugin.data?.tableColumnHeaderSetter?.specialLabel : [];

    settings.headerSetterRules = rules?.map((item): HeaderSetterRule => ({
      parameter: item['@switchingParameterName'],
      property: item['@ChannelPropertyName'],
      column: item['@columnName'],
    })) ?? [];

    return settings;
  }

  if (type === 'chart') {
    const res: Res<ChartFormSettings> = await formsAPI.getFormSettings(id);
    if (!res.ok) return {};
    const settings = res.data;

    const seriesSettingsKeys = Object.keys(settings.seriesSettings);
    const firstSeries = settings.seriesSettings[seriesSettingsKeys[0]];
    settings.dateStep = firstSeries?.dateStep === 'Month' ? 'month' : 'year';
    settings.tooltip = false;
    return settings;
  }
  return {};
}
