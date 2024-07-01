import { t } from 'shared/locales';
import { fetcher } from 'shared/lib';
import { useReportStore } from 'entities/report';
import { useChannelStore } from 'entities/channel';
import { addSessionClient } from 'entities/client';
import { showWarningMessage } from 'entities/window';
import { showNotification } from 'entities/notification';
import { lockParameters, unlockParameters } from 'entities/parameter';
import { initializeObjects, initializeObjectModels } from 'entities/objects';

import { useAppStore } from './app.store';
import { appAPI } from '../lib/app.api';
import { getSessionToSave } from '../lib/session-save';
import { clearSessionData } from '../lib/session-clear';
import { RootClientFactory } from '../lib/root-factory';
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
  setLoadingStep('session');
  const systemID = useAppStore.getState().systemID;
  if (systemID !== null) clearSessionData();

  const res = await appAPI.startSession(systemID, isDefault);
  if (!res.ok) return setLoadingError('app.session-creation-error');
  const { id: sessionID, root: rootID } = res.data;
  fetcher.setSessionID(sessionID);

  setLoadingStep('data');
  const factory = new RootClientFactory(rootID);
  const root = await factory.createState();
  if (!root) return setLoadingError('app.root-creation-error');

  const appState = useAppStore.getState();
  if (appState.sessionIntervalID !== null) window.clearInterval(appState.sessionIntervalID);
  appState.sessionIntervalID = window.setInterval(extendSession, 2 * 60 * 1000);

  const channels = factory.getChannels();
  const parameters = factory.getParameters();
  lockParameters(parameters);
  addSessionClient(root);

  const objects = initializeObjects(parameters, channels);
  const layoutController = root.layout.controller;
  layoutController.traceExist = Boolean(objects.trace.parameterID);

  const reports = useReportStore.getState();
  reports.layoutController = layoutController;

  appState.initQueue.push(root.activeChildID);
  initializePresentations(appState.initQueue).then();
  setLoadingStep('data', true);

  const fillSuccess = await factory.fillData();
  if (!fillSuccess) showWarningMessage(t('app.root-data-init-error'));
  unlockParameters(parameters);
  initializeObjectModels(parameters, channels);
  useChannelStore.setState(channels);
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
