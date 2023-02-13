import { Dispatch } from 'redux';
import { Thunk } from 'shared/lib';
import { formsAPI } from 'widgets/form/forms.api';
import { fillChannels } from 'entities/channels';
import { createClientChannels } from 'widgets/presentation/lib/initialization';
import { applyChannelsDeps } from 'widgets/presentation/lib/channels-auto-update';
import { setParams } from 'entities/parameters';
import { setChannels } from 'entities/channels';
import { fetchSessionStart, fetchSessionEnd, fetchSessionError } from 'entities/fetch-state';
import { setRootFormState } from './root-form.actions';
import { setSessionID } from '../../../app/store/app-state/app.actions';
import { sessionManager } from '../../../app/store';


/** Инициализация новой сессии. */
export const startSession = (isDefault: boolean): Thunk => {
  return async (dispatch: Dispatch) => {
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
    await fillChannels(channels, paramDict);

    dispatch(setParams(id, parameters));
    dispatch(setChannels(channels));
    dispatch(setRootFormState(root));
    dispatch(setSessionID(resSessionID.data));
    dispatch(fetchSessionEnd());
  };
};


/** Создаёт состояние главной формы. */
async function createRootFormState(): Promise<Omit<RootFormState, 'layout'> | string> {
  const resRootForm = await formsAPI.getRootForm();
  if (!resRootForm.ok) return 'ошибка при получении данных главной формы';
  const id = resRootForm.data.id;

  const [resPresentations, resChildren, resSettings] = await Promise.all([
    formsAPI.getPresentationsList(id),
    formsAPI.getFormChildren(id),
    formsAPI.getPluginData(id, 'dateChanging'),
  ]);

  if (!resPresentations.ok) return 'ошибка при получении списка презентаций';
  const presentationsTree = resPresentations.data.items;

  if (!resChildren.ok) return 'ошибка при получении данных презентаций';
  const { children, activeChildren: [activeChildID] } = resChildren.data;

  const settings = await createRootFormSettings(resSettings);
  return {id, settings, presentationTree: presentationsTree, children, activeChildID};
}

/** Создаёт объект настроек главной формы. */
async function createRootFormSettings(res: Res<any>): Promise<DockSettings> {
  const dateChangingRaw = res.data?.dateChanging;

  const dateChanging = dateChangingRaw ? {
    year: dateChangingRaw['@yearParameter'],
    dateInterval: dateChangingRaw['@dateIntervalParameter'],
    columnName: dateChangingRaw['@columnNameParameter'] ?? null
  } : null;
  return {dateChanging, parameterGroups: null};
}
