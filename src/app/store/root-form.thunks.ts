import { t } from 'shared/locales';
import { clientAPI } from 'entities/client';
import { fillChannels } from 'entities/channel';
import { addClientParameters, rowToParameterValue } from 'entities/parameter';
import { setChannels } from 'entities/channel';
import { showNotification } from 'entities/notification';
import { showWarningMessage } from 'entities/window';
import { sessionFetchingStart, sessionFetchingEnd } from 'entities/fetch-state';
import { createObjects, createObjectModels, setObjects } from 'entities/objects';
import { createLeftLayout, handlePresentationTree } from 'widgets/left-panel';
import { createClientChannels } from 'widgets/presentation/lib/initialization';
import { applyChannelsDeps } from 'widgets/presentation/lib/utils';

import { LayoutManager } from '../lib/layout';
import { appAPI } from '../lib/app.api';
import { setRootFormState } from './root-form.actions';
import { setSessionID } from './app.actions';
import { getSessionToSave } from '../lib/session-save';
import { startNewSession } from '../lib/session-utils';


/** Сохранение текущей сессии. */
export async function saveSession(): Promise<void> {
  const res = await appAPI.saveSession(getSessionToSave());
  if (res.ok && res.data) {
    showNotification(t('messages.session-save-ok'));
  } else {
    showWarningMessage(t('messages.session-save-error'));
  }
}

/** Инициализация новой сессии. */
export async function startSession(isDefault: boolean): Promise<void> {
  sessionFetchingStart();
  const resSessionID = await startNewSession(isDefault);
  if (resSessionID.ok === false) { sessionFetchingEnd(resSessionID.message); return; }

  const arg = typeof resSessionID.data === 'object' ? resSessionID.data.root : undefined;
  const [root, parameters] = await createRootFormState(arg);
  if (!root) { sessionFetchingEnd(t('messages.root-fetch-error')); return; }

  const paramDict = {root: parameters};
  const channels = await createClientChannels(new Set(), parameters, []);
  applyChannelsDeps(channels, paramDict);
  await checkParamValues(channels, paramDict);
  handlePresentationTree(root.settings.presentationTree, parameters);

  addClientParameters('root', parameters);
  setChannels(channels);
  setRootFormState(root);

  const objects = createObjects();
  root.layout.common.traceExist = Boolean(objects.trace.parameterID);
  setObjects(objects);

  setSessionID(resSessionID.data);
  sessionFetchingEnd();

  for (const name in channels) channels[name] = {...channels[name]};
  await fillChannels(channels, paramDict);
  setChannels(channels);
  setObjects(createObjectModels());
}

async function createRootFormState(id?: ClientID): Promise<[RootFormState, Parameter[]]> {
  if (!id) { // in the case of the legacy API
    const { ok, data } = await clientAPI.getRootForm();
    if (!ok) return [null, null];
    id = data.id;
  }
  const res = await clientAPI.getClientData(id, 'dock');
  if (!res.ok) return [null, null];

  const { children: childrenRaw, settings, layout: layoutRaw, parameters } = res.data;
  const { children, activeChildren: [activeChildID] } = childrenRaw;

  const layout = {common: new LayoutManager(layoutRaw.layout), left: createLeftLayout(layoutRaw)};
  return [{id, children, activeChildID, settings, layout}, parameters];
}

/** Проверяет, чтобы у всех параметров было корректное значение. */
async function checkParamValues(channelDict: ChannelDict, paramDict: ParamDict) {
  const paramsToFill = Object.values(paramDict)[0].filter((param) => {
    if (param.getValue() !== null || !param.channelName) return false;
    return !param.editor || param.editor.canBeNull;
  });
  if (paramsToFill.length === 0) return;

  const channelsToFill: ChannelDict = {};
  paramsToFill.forEach((parameter) => {
    const channelName = parameter.channelName;
    channelsToFill[channelName] = channelDict[channelName];
  });
  await fillChannels(channelsToFill, paramDict);

  for (const parameter of paramsToFill) {
    const channel = channelsToFill[parameter.channelName];
    const row = channel?.data?.rows?.at(0);
    if (row) parameter.setValue(rowToParameterValue(row, channel));
  }
}
