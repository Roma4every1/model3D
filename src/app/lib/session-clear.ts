import { fetcher } from 'shared/lib';
import { clearParameterStore } from 'entities/parameter';
import { clearChannelStore } from 'entities/channel';

import { useClientStore } from 'entities/client';
import { useWindowStore } from 'entities/window';
import { useNotificationStore } from 'entities/notification';
import { useProgramStore } from 'entities/program';

import { useTableStore } from 'features/table';
import { useChartStore } from 'features/chart';
import { useMapStore } from 'features/map';
import { useMultiMapStore } from 'features/multi-map';
import { useCaratStore } from 'features/carat';
import { useProfileStore } from 'features/profile';
import { useFileViewStore } from 'features/file';
import { useFileListStore } from 'features/file-list';
import { useSlideStore } from 'features/slide';


/** Очищает данные текущей сессии, оставляя общие данные приложения. */
export function clearSessionData(): void {
  fetcher.setSessionID('');
  clearChannelStore();
  clearParameterStore();
  useWindowStore.setState({}, true);
  useNotificationStore.setState({notifications: []}, true);
  useProgramStore.setState({models: {}, operations: [], layoutController: null}, true);

  useClientStore.setState({}, true);
  useTableStore.setState({}, true);
  useChartStore.setState({}, true);
  useMapStore.setState({}, true);
  useMultiMapStore.setState({}, true);
  useCaratStore.setState({}, true);
  useProfileStore.setState({}, true);
  useFileListStore.setState({}, true);
  useFileViewStore.setState({}, true);
  useSlideStore.setState({}, true);
}
