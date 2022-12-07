import { getRootFormID, stringToTableCell } from "../utils/utils";


/** Селекторы. */
export const selectors = {
  /** Общее состояние приложения. */
  appState: (state: WState) => state.appState,
  /** Клиентская конфигурация. */
  config: (state: WState) => state.appState.config.data as ClientConfiguration,
  /** ID сессии. */
  sessionID: (state: WState) => state.sessionId,
  /** Менеджер сессии. */
  sessionManager: (state: WState) => state.sessionManager,
  /** Конфиг плагинов. */
  plugins: (state: WState) => state.layout.plugins,
  /** Плагины внутри формы. */
  innerPlugins: (state: WState) => state.layout.plugins.inner,
  /** Плагины в верхней панели. */
  stripPlugins: (state: WState) => state.layout.plugins.strip,
  /** Прототип разметки левой панели. */
  leftLayout: (state: WState) => state.layout.left,
  /** Данные канала; `this - channelName`. */
  channel: channelSelector,
  /** Разметка конкретной формы; `this - formID`. */
  formLayout: formLayoutSelector,
  /** Настройки формы; `this - formID`. */
  formSettings: formSettingsSelector,
  /** Параметры конкретной формы; `this - formID`. */
  formParams: formParamsSelector,
  /** Список доступных программ для формы. */
  formPrograms: formProgramsSelector,
  /** Список дочерних форм; `this - formID`. */
  formChildrenState: formChildrenStateSelector,
  /** Активный потомок формы; `this - formID`. */
  activeChild: activeChildSelector,
  /** ID активного потомка формы; `this - formID`. */
  activeChildID: activeChildIDSelector,

  caratState: caratStateSelector,
  chartState: chartStateSelector,
  mapsState: (state: WState) => state.maps,
  multiMapState: multiMapStateSelector,
  mapState: mapStateSelector,
  windows: (state: WState) => state.windowData?.windows,

  currentWellID: currentWellIDSelector,
}

function formLayoutSelector(this: FormID, state: WState): FormLayout {
  return state.formLayout[this];
}
function formSettingsSelector(this: FormID, state: WState) {
  return state.formSettings[this];
}
function formParamsSelector(this: FormID, state: WState): FormParameter[] {
  return state.formParams[this];
}
function formProgramsSelector(this: FormID, state: WState): FetchState<ProgramListData> {
  return state.programs[this];
}

function formChildrenStateSelector(this: FormID, state: WState): FormChildrenState {
  return state.childForms[this];
}
function activeChildIDSelector(this: FormID, state: WState): FormID {
  return state.childForms[this]?.activeChildren[0];
}
function activeChildSelector(this: FormID, state: WState) {
  const formChildrenState = state.childForms[this];
  const activeChildID = formChildrenState?.activeChildren[0];
  return formChildrenState?.children.find(child => child.id === activeChildID);
}

function channelSelector(this: ChannelName, state: WState) {
  return state.channelsData[this];
}

function caratStateSelector(this: FormID, state: WState): any {
  return state.carats[this];
}
function chartStateSelector(this: FormID, state: WState): ChartState {
  return state.charts[this];
}

function multiMapStateSelector(this: FormID, state: WState): MultiMapState {
  return state.maps.multi[this];
}
function mapStateSelector(this: FormID, state: WState): MapState {
  return state.maps.single[this];
}

function currentWellIDSelector(this: FormID, state: WState): string | null {
  const rootFormParams = state.formParams[getRootFormID(this)];
  const currentWellParam = rootFormParams.find((param) => param.id === 'currentWell');
  return currentWellParam ? stringToTableCell(currentWellParam.value, 'LOOKUPVALUE') : null;
}
