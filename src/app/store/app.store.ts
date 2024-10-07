import { create } from 'zustand';


/** Общее состояние приложения. */
export const useAppStore = create((): AppState => ({
  location: getAppLocation(),
  systemList: null,
  systemID: null,
  sessionIntervalID: null,
  loading: {step: 'init'},
  initQueue: [],
}));

export function useAppLocation(): string {
  return useAppStore(state => state.location);
}

/** Определяет расположение клиента относительно корневого пути.
 * @example
 * '/' => '/'
 * '/id3x/client/index.html' => '/id3x/client/'
 * '/id3x/client/systems/' => '/id3x/client/'
 * '/id3x/client/systems/SYSTEM/' => '/id3x/client/'
 */
function getAppLocation(): string {
  let location = window.location.pathname;
  if (location.endsWith('index.html')) {
    location = location.substring(0, location.length - 10);
  }
  if (location.includes('/systems/')) {
    location = location.substring(0, location.indexOf('systems/'))
  }
  if (!location.endsWith('/')) location += '/';
  return location;
}
