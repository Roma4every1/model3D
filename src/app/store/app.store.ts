import { create } from 'zustand';
import { InstanceController } from '../lib/instance-controller';


/** Общие данные приложения. */
export interface AppState {
  /** Путь к начальной странице относительно хоста. */
  readonly location: string;
  /** Список систем. */
  systemList: SystemList;
  /** ID текущей системы. */
  systemID: SystemID;
  /** ID из `setInterval` для запроса `extendSession`. */
  sessionIntervalID: number;
  /** Состояние загрузки. */
  loading: AppLoadingState;
  /** Очередь инициализации презентаций. */
  readonly initQueue: ClientID[];
  /** Контроллер экземпляров приложения. */
  readonly instanceController: InstanceController;
}

/** Общее состояние приложения. */
export const useAppStore = create((): AppState => ({
  location: getAppLocation(),
  systemList: null,
  systemID: null,
  sessionIntervalID: null,
  loading: {step: 'init'},
  initQueue: [],
  instanceController: new InstanceController(),
}));

export function useAppLocation(): string {
  return useAppStore(state => state.location);
}

/**
 * Определяет расположение клиента относительно корневого пути.
 * @example
 * '/' => '/'
 * '/wm/client/index.html' => '/wm/client/'
 * '/wm/client/systems/' => '/wm/client/'
 * '/wm/client/systems/SYSTEM/' => '/wm/client/'
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
