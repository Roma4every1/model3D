import type { ParameterStore, ParameterUpdateData } from 'entities/parameter';
import { t } from 'shared/locales';
import { fetcher } from 'shared/lib';
import { useProgramStore } from 'entities/program';
import { useChannelStore, addChannels, setChannels } from 'entities/channel';
import { useParameterStore, lockParameters, unlockParameters } from 'entities/parameter';
import { addSessionClient } from 'entities/client';
import { showWarningMessage } from 'entities/window';
import { showNotification } from 'entities/notification';
import { initializeObjects, initializeObjectModels } from 'entities/objects';

import { useAppStore } from './app.store';
import { appAPI } from '../lib/app.api';
import { profileAPI } from 'features/profile';
import { TableStateFactory } from 'features/table';
import { RootClientFactory } from '../lib/root-factory';
import { InstanceController } from '../lib/instance-controller';
import { getSessionToSave } from '../lib/session-save';
import { clearSessionData } from '../lib/session-clear';
import { initializePresentations } from './presentations';


/** Сохранение текущей сессии. */
export async function saveSession(): Promise<void> {
  const res = await appAPI.saveSession(getSessionToSave());
  if (res.ok && res.data) {
    showNotification(t('app.session-saved'));
  } else {
    showWarningMessage(t('app.session-saving-error'));
  }
}

/* --- --- */

/** Инициализация новой сессии. */
export async function startSession(isDefault: boolean): Promise<void> {
  let appState = useAppStore.getState();
  const needClear = appState.loading.done;
  setLoadingStep('session');
  if (needClear) clearSessionData();

  const res = await appAPI.startSession(appState.systemID, isDefault);
  if (!res.ok) return setLoadingError('app.session-creation-error');
  const { id: sessionID, root: rootID } = res.data;
  fetcher.setSessionID(sessionID);
  setGlobalListener(appState.instanceController);

  setLoadingStep('data');
  const factory = new RootClientFactory(rootID, appState.instanceController);
  const root = await factory.createState();
  if (!root) return setLoadingError('app.root-creation-error');

  appState = useAppStore.getState();
  if (appState.sessionIntervalID !== null) window.clearInterval(appState.sessionIntervalID);
  appState.sessionIntervalID = window.setInterval(extendSession, 2 * 60 * 1000);

  const channels = factory.getChannels();
  const parameters = factory.getParameters();
  lockParameters(parameters);
  addChannels(channels);
  addSessionClient(root);

  const channelDict = useChannelStore.getState().storage;
  const objects = initializeObjects(parameters, channelDict);
  const layoutController = root.layout.controller;
  layoutController.traceExist = Boolean(objects.trace.parameterID);
  useProgramStore.getState().layoutController = layoutController;

  const systemInfo = appState.systemList.find(info => info.id === appState.systemID);
  TableStateFactory.defaultTextWrap = systemInfo.dataWrap ?? true;
  profileAPI.setBaseURL(systemInfo.apacheUrl);

  const fillPromise = factory.fillData();
  appState.initQueue.push(root.activeChildID);
  initializePresentations(appState.initQueue, fillPromise).then();
  setLoadingStep('data', true);

  const fillSuccess = await fillPromise;
  if (!fillSuccess) showWarningMessage(t('app.root-data-init-error'));
  unlockParameters(parameters);
  initializeObjectModels(parameters, channelDict);
  setChannels(channels);
}

function setLoadingStep(step: AppLoadingStep, done?: boolean): void {
  useAppStore.setState({loading: {step, done}});
}
function setLoadingError(m: string): void {
  const step = useAppStore.getState().loading.step;
  useAppStore.setState({loading: {step, error: m}});
}

async function extendSession(): Promise<void> {
  const res = await appAPI.extendSession();
  if (res.ok && res.data) return;
  const intervalID = useAppStore.getState().sessionIntervalID;
  if (intervalID !== null) window.clearInterval(intervalID);
  showWarningMessage(t('app.session-lost'));
}

/**
 * Установка слушателя событий изменения параметров для синхронизации
 * глобальных параметров с дочерними экземплярами приложения.
 */
function setGlobalListener(instanceController: InstanceController): void {
  instanceController.destroy();
  const parameterStore = useParameterStore.getState();

  parameterStore.globalListener = (state: ParameterStore, data: ReadonlyArray<ParameterUpdateData>) => {
    if (instanceController.main && instanceController.empty()) return;
    const rootParameters = state.clients.root;
    const payload: {name: string, value: any}[] = [];

    for (const { id, newValue } of data) {
      const parameter = rootParameters.find(p => p.id === id);
      if (parameter) payload.push({name: parameter.name, value: newValue});
    }
    if (payload.length) {
      instanceController.broadcast('ugp', payload);
    }
  };
}
