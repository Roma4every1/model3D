import { API } from './api';
import { sessionManager } from '../store';


/** По конфигу устанавливает значение для ссылки на службу запросов. */
export function createClientConfig(data: unknown): ClientConfiguration {
  const config: ClientConfiguration = {webServicesURL: '', root: getAppLocation()};

  if (data instanceof Object) {
    const configURL = data['webServicesURL'];
    if (typeof configURL === 'string') config.webServicesURL = configURL;
  }

  if (config.webServicesURL.length === 0) {
    let pathName = window.location.pathname.slice(1);
    if (pathName.includes('/')) {
      pathName = pathName.slice(0, pathName.indexOf('/'));
    }
    const webServicesURL = window.location.origin + '/' + pathName + '/WebRequests.svc/';
    console.warn('use default URL for web requests: ' + webServicesURL);
    console.warn('invalid config:\n', data);
    config.webServicesURL = webServicesURL;
  }

  return config;
}

export function getAppLocation() {
  let location = window.location.pathname;
  if (location.includes('/systems/')) {
    location = location.slice(0, location.indexOf('systems/'))
  }
  if (!location.endsWith('/')) location += '/';
  return location;
}

/* --- --- */

/** Загрузка первичных данных системы.
 * 1. id главной формы
 * 2. список презентаций
 * 3. список дочерних форм
 * 4. настройки главной формы
 * 5. глобальные параметры
 * */
export async function fetchRootFormState(): Promise<RootFormState | string> {
  const resRootForm = await API.forms.getRootForm();
  if (!resRootForm.ok) return 'ошибка при получении данных главной формы';
  const id = resRootForm.data.id;

  const resPresentations = await API.getPresentationsList(id);
  if (!resPresentations.ok) return 'ошибка при получении списка презентаций';
  const presentations = resPresentations.data.items;

  const resChildren = await API.forms.getFormChildren(id);
  if (!resChildren.ok) return 'ошибка при получении данных презентаций';
  const children = resChildren.data;

  const resSettings = await API.getPluginData(id, 'dateChanging');
  const dateChangingRaw = resSettings.data?.dateChanging;

  const dateChanging = dateChangingRaw ? {
    year: dateChangingRaw['@yearParameter'],
    dateInterval: dateChangingRaw['@dateIntervalParameter'],
    columnName: dateChangingRaw['@columnNameParameter'] ?? null
  } : null;
  const settings: DockFormSettings = {dateChanging, parameterGroups: null};

  const resParams = await API.forms.getFormParameters(id);
  if (!resParams.ok) return 'ошибка при получении глобальных параметров';
  const parameters = resParams.data;

  for (const param of parameters) {
    param.formID = id;
    const channel = param['externalChannelName'];
    if (channel && param.canBeNull === false) {
      await sessionManager.channelsManager.loadAllChannelData(channel, id, false);
    }
  }
  await sessionManager.channelsManager.loadFormChannelsList(id);
  sessionManager.channelsManager.setFormInactive(id);

  return {id, settings, children, parameters, presentations};
}
