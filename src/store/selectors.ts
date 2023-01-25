import { stringToTableCell, getParentFormId } from '../utils/utils';


/** Селекторы. */
export const selectors = {
  /** Общее состояние приложения. */
  appState: (state: WState) => state.appState,
  /** Клиентская конфигурация. */
  config: (state: WState) => state.appState.config,
  /** ID корневой формы. */
  rootFormID: (state: WState) => state.appState.rootFormID,
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
  /** Параметр конкретной формы; `this - {formID, id}`. */
  formParam: formParamSelector,
  /** Значение параметра конкретной формы; `this - {formID, id}`. */
  formParamValue: formParamValueSelector,
  /** Список доступных программ для формы. */
  formPrograms: formProgramsSelector,
  /** Список дочерних форм; `this - formID`. */
  formChildrenState: formChildrenStateSelector,
  /** Активный потомок формы; `this - formID`. */
  activeChild: activeChildSelector,
  /** ID активного потомка формы; `this - formID`. */
  activeChildID: activeChildIDSelector,

  /** Хранилище состояния каротажной формы. */
  caratState: caratStateSelector,
  /** Хранилище состояния карты. */
  mapState: mapStateSelector,

  mapsState: (state: WState) => state.maps,
  multiMapState: multiMapStateSelector,
  windows: (state: WState) => state.windowData?.windows,
  /** ID текущей скважины. */
  currentWellID: currentWellIDSelector,
  globalParam: globalParamSelector,

  /** {@link FormChildrenState} текущей презентации. */
  displayedPresentation: displayedPresentationSelector,
  /** ID текущей презентации. */
  displayedPresentationID: displayedPresentationIDSelector,
  /** Список типов всех отображаемых форм (без повторений). */
  displayedFormTypes: displayedFormTypesSelector,
};

function globalParamSelector(this: ParameterID, state: WState): FormParameter {
  const globalParams = state.formParams[state.appState.rootFormID];
  return globalParams.find(param => param.id === this);
}

function formLayoutSelector(this: FormID, state: WState) {
  return state.formLayout[this];
}
function formSettingsSelector(this: FormID, state: WState) {
  return state.formSettings[this];
}
function formProgramsSelector(this: FormID, state: WState): FetchState<ProgramListData> {
  return state.programs[this];
}

function formParamsSelector(this: FormID, state: WState): FormParameter[] {
  return state.formParams[this];
}
function formParamSelector(this: {formID: FormID, id: ParameterID}, state: WState) {
  const formParams = state.formParams[this.formID];
  return formParams?.find(param => param.id === this.id);
}
function formParamValueSelector(this: {formID: FormID, id: ParameterID}, state: WState) {
  const formsParams = state.formParams;
  const findByID = param => param.id === this.id;

  const formParams = formsParams[this.formID];
  const fromForm = formParams?.find(findByID);
  if (fromForm) return fromForm.value;

  const parentParams = formsParams[getParentFormId(this.formID)];
  const fromParent = parentParams?.find(findByID);
  if (fromParent) return fromParent.value;

  return formsParams[state.appState.rootFormID].find(findByID)?.value;
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

function multiMapStateSelector(this: FormID, state: WState): MultiMapState {
  return state.maps.multi[this];
}
function mapStateSelector(this: FormID, state: WState): MapState {
  return state.maps.single[this];
}

function currentWellIDSelector(state: WState): string | null {
  const rootFormParams = state.formParams[state.appState.rootFormID];
  const currentWellParam = rootFormParams.find((param) => param.id === 'currentWell');
  const value = currentWellParam?.value;
  return value ? stringToTableCell(value as string, 'LOOKUPVALUE') : null;
}
function displayedPresentationIDSelector(state: WState): FormID {
  return state.childForms[state.appState.rootFormID]?.activeChildren[0]
}
function displayedPresentationSelector(state: WState) {
  const presentationID = state.childForms[state.appState.rootFormID]?.activeChildren[0];
  return state.childForms[presentationID];
}

function displayedFormTypesSelector(state: WState): FormType[] {
  const activePresentationID = state.childForms[state.appState.rootFormID]?.activeChildren[0];
  const presentation = state.childForms[activePresentationID];
  if (!presentation) return [];

  const formTypes = presentation.children
    .filter(child => presentation.openedChildren.includes(child.id))
    .map(child => child.type);

  return [...new Set(formTypes)];
}
