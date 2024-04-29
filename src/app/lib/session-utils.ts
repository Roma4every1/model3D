import { t } from 'shared/locales';
import { fetcher } from 'shared/lib';
import { appAPI } from './app.api';
import { getSessionToSave } from './session-save';
import { showWarningMessage } from 'entities/window';

import { useAppStore } from '../store/app.store';
import { useClientStore } from 'entities/client';
import { useFetchStateStore } from 'entities/fetch-state';
import { useWindowStore } from 'entities/window';
import { useNotificationStore } from 'entities/notification';
import { useChannelStore } from 'entities/channel';
import { useParameterStore } from 'entities/parameter';
import { useReportStore } from 'entities/report';

import { useTableStore } from 'features/table';
import { useChartStore } from 'features/chart';
import { useMapStore, useMultiMapStore } from 'features/map';
import { useCaratStore } from 'features/carat';
import { useProfileStore } from 'features/profile';
import { useFileViewStore } from 'features/file';
import { useFileListStore } from 'features/file-list';
import { usePresentationStore } from 'widgets/presentation';


export async function startNewSession(isDefault: boolean) {
  const appState = useAppStore.getState();
  const presentations = usePresentationStore.getState();
  if (Object.keys(presentations).length > 0) clearSessionData();

  const systemName = appState.systemID;
  const res = await appAPI.startSession(systemName, isDefault);

  if (res.ok) {
    const intervalID = appState.sessionIntervalID;
    if (intervalID !== null) clearInterval(intervalID);

    const extendSession = async () => {
      const res = await appAPI.extendSession();
      if (res.ok && res.data) return;
      const intervalID = useAppStore.getState().sessionIntervalID;
      if (intervalID !== null) clearInterval(intervalID);
      showWarningMessage(t('messages.session-lost'));
    };

    fetcher.setSessionID(res.data.id);
    appState.sessionIntervalID = window.setInterval(extendSession, 2 * 60 * 1000);
  } else {
    showWarningMessage(res.message);
  }
  return res;
}

/** Очищает данные текущей сессии, оставляя общие данные приложения. */
function clearSessionData(): void {
  fetcher.setSessionID('');
  useAppStore.setState({sessionID: null});
  useFetchStateStore.setState({}, true);
  useWindowStore.setState({}, true);
  useNotificationStore.setState({notifications: []}, true);
  useChannelStore.setState({}, true);
  useParameterStore.setState({}, true);
  useReportStore.setState({models: {}, operations: []}, true);

  useClientStore.setState({}, true);
  usePresentationStore.setState({}, true);
  useTableStore.setState({}, true);
  useChartStore.setState({}, true);
  useMapStore.setState({}, true);
  useMultiMapStore.setState({}, true);
  useCaratStore.setState({}, true);
  useProfileStore.setState({}, true);
  useFileListStore.setState({}, true);
  useFileViewStore.setState({}, true);
}

export function beforeunloadCallback() {
  appAPI.stopSession(getSessionToSave()).then();
}
