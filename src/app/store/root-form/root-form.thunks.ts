import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { fillChannels } from 'entities/channels';
import { createLeftLayout } from 'widgets/left-panel';
import { createClientChannels } from 'widgets/presentation/lib/initialization';
import { applyChannelsDeps } from 'widgets/presentation/lib/utils';
import { setParamDict } from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { setChannels } from 'entities/channels';
import { fetchSessionStart, fetchSessionEnd, fetchSessionError } from 'entities/fetch-state';
import { createObjects, createObjectModels, setObjects } from 'entities/objects';
import { setRootFormState } from './root-form.actions';
import { setSessionID } from '../app-state/app.actions';
import { formsAPI } from 'widgets/presentation/lib/forms.api';
import { sessionManager } from '../index';


/** Инициализация новой сессии. */
export const startSession = (isDefault: boolean): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    dispatch(fetchSessionStart());

    const resSessionID = await sessionManager.startSession(isDefault);
    if (resSessionID.ok === false) {
      dispatch(fetchSessionError(resSessionID.data)); return;
    }

    const root = await createRootFormState();
    if (typeof root === 'string') {
      dispatch(fetchSessionError(root)); return;
    }

    const id = root.id;
    const parameters = await formsAPI.getFormParameters(id);
    const paramDict = {[id]: parameters};

    const names = await formsAPI.getFormChannelsList(id);
    const channels = await createClientChannels(new Set(names), paramDict, []);
    applyChannelsDeps(channels, paramDict);
    await checkParamValues(channels, paramDict);

    dispatch(setParamDict(paramDict));
    dispatch(setChannels(channels));
    dispatch(setRootFormState(root));
    dispatch(setObjects(createObjects(getState())));
    dispatch(setSessionID(resSessionID.data));
    dispatch(fetchSessionEnd());

    await fillChannels(channels, paramDict);
    dispatch(setObjects(createObjectModels(getState())));
  };
};

/** Проверяет, чтобы у всех параметров было корректное значение. */
async function checkParamValues(channelDict: ChannelDict, paramDict: ParamDict) {
  const paramsToFill = Object.values(paramDict)[0].filter((param) => {
    return param.canBeNull === false && param.externalChannelName && param.value === null;
  });
  if (paramsToFill.length === 0) return;

  const channelsToFill: ChannelDict = {};
  paramsToFill.forEach((parameter) => {
    const channelName = parameter.externalChannelName;
    channelsToFill[channelName] = channelDict[channelName];
  });
  await fillChannels(channelsToFill, paramDict);

  for (const parameter of paramsToFill) {
    const channel = channelsToFill[parameter.externalChannelName];
    const rows = channel?.data?.rows;
    if (rows?.length) parameter.value = tableRowToString(channel, rows[0]) ?? null;
  }
}

/** Создаёт состояние главной формы. */
async function createRootFormState(): Promise<RootFormState | string> {
  const resRootForm = await formsAPI.getRootForm();
  if (!resRootForm.ok) return 'Ошибка при получении данных главной формы';
  const id = resRootForm.data.id;

  const [resPresentations, resChildren, resSettings, resLayout] = await Promise.all([
    formsAPI.getPresentationsList(id),
    formsAPI.getFormChildren(id),
    formsAPI.getFormSettings(id),
    formsAPI.getFormLayout(id),
  ]);

  if (!resPresentations.ok) return 'Ошибка при получении списка презентаций';
  const presentationsTree = resPresentations.data.items;

  if (!resChildren.ok) return 'Ошибка при получении данных презентаций';
  const { children, activeChildren: [activeChildID] } = resChildren.data;

  const dateChangingRaw = resSettings.data?.dateChanging;
  const dateChanging = dateChangingRaw?.year ? dateChangingRaw : null;
  const settings: DockSettings = {dateChanging, parameterGroups: null};

  const layout = createDockLayout(resLayout);
  return {id, settings, layout, presentationTree: presentationsTree, children, activeChildID};
}

function createDockLayout(res: Res<any>): DockLayout {
  const data = res.ok ? res.data : {};
  const layout = data.layout;

  return {
    common: {
      selectedTopTab: layout?.selectedtop ?? -1,
      selectedRightTab: layout?.selectedright ?? -1,
      topPanelHeight: 90,
      leftPanelWidth: layout?.sizeleft ?? 270,
      rightPanelWidth: layout?.sizeright ?? 270,
    },
    left: createLeftLayout(data),
  };
}
