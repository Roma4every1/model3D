import {AppStateAction, AppStateActions} from "./reducers/appState";
import {CanRunReportAction, CanRunReportActions} from "./reducers/canRunReport";
import {ChannelsDataAction, ChannelsDataActions} from "./reducers/channelsData";
import {ChannelsLoadingAction, ChannelsLoadingActions} from "./reducers/channelsLoading";
import {ChildFormsAction, ChildFormsActions} from "./reducers/childForms";
import {FormRefsAction, FormRefsActions} from "./reducers/formRefs";
import {FormParamsAction, FormParamsActions} from "./reducers/formParams";
import {FormSettingsAction, FormSettingsActions} from "./reducers/formSettings";
import {FormLayoutAction, FormLayoutActions} from "./reducers/formLayout";
import {LayoutAction, LayoutActions} from "./reducers/layout";
import {ChartsAction, ChartsActions} from "./reducers/charts";
import {MapsAction, MapsActions} from "./reducers/maps";
import {PresentationsAction, PresentationsActions} from "./reducers/presentations";
import {ProgramsAction, ProgramsActions} from "./reducers/programs";
import {ReportsAction, ReportsActions} from "./reducers/reports";
import {SessionIDAction, SessionIDActions} from "./reducers/sessionId";
import {SessionManagerAction, SessionManagerActions} from "./reducers/sessionManager";
import {WindowDataAction, WindowDataActions} from "./reducers/windowData";


export class WellManagerActionsCreator {
  /* --- App State Actions --- */

  /** Начало загрузки клиентской конфигурации. */
  public fetchConfigStart(): AppStateAction {
    return {type: AppStateActions.FETCH_CONFIG_START};
  }
  /** Конец загрузки клиентской конфигурации. */
  public fetchConfigEnd(payload: Res<ClientConfiguration>): AppStateAction {
    return {type: AppStateActions.FETCH_CONFIG_END, payload};
  }
  /** Начало загрузки списка систем. */
  public fetchSystemListStart(): AppStateAction {
    return {type: AppStateActions.FETCH_SYSTEM_LIST_START};
  }
  /** Конец загрузки списка систем. */
  public fetchSystemListEnd(payload: Res<SystemList>): AppStateAction {
    return {type: AppStateActions.FETCH_SYSTEM_LIST_END, payload};
  }
  /** Начало загрузки новой сессии. */
  public fetchSessionStart(): AppStateAction {
    return {type: AppStateActions.FETCH_SESSION_START};
  }
  /** Конец загрузки новой сессии. */
  public fetchSessionEnd(payload: Res<SessionID>): AppStateAction {
    return {type: AppStateActions.FETCH_SESSION_END, payload};
  }
  /** Установить новый ID сессии. */
  public setSessionID(sessionID: SessionID): AppStateAction {
    return {type: AppStateActions.SET_SESSION_ID, payload: sessionID};
  }
  /** Установить новую систему. */
  public setSystemName(systemName: SystemID): AppStateAction {
    return {type: AppStateActions.SET_SYSTEM_ID, payload: systemName};
  }
  /** Очистить хранилище сесиии. */
  public clearSession(): AppStateAction {
    return {type: AppStateActions.CLEAR_SESSION_ID};
  }

  /* --- Can Run Report Actions --- */

  public setCanRunReport(value: CanRunReport): CanRunReportAction {
    return {type: CanRunReportActions.SET, value};
  }

  /* --- Channels Data Actions --- */

  public setChannelsData(channelName: ChannelName, channelData): ChannelsDataAction {
    return {type: ChannelsDataActions.SET, channelName, channelData};
  }

  /* --- Channels Loading Actions --- */

  public setChannelsLoading(channelName: ChannelName, loading: IsChannelLoading): ChannelsLoadingAction {
    return {type: ChannelsLoadingActions.SET, channelName, loading};
  }

  /* --- Child Forms Actions --- */

  /** Устанавливает состояние дочерних форм. */
  public setChildForms(formID: FormID, payload: FormChildrenState): ChildFormsAction {
    return {type: ChildFormsActions.SET, formID, payload};
  }
  /** Устанавливает список открытых дочерних форм. */
  public setOpenedChildren(formID: FormID, payload: OpenedChildrenList): ChildFormsAction {
    return {type: ChildFormsActions.SET_OPENED, formID, payload};
  }
  /** Устанавливает список активных дочерних форм. */
  public setActiveChildren(formID: FormID, payload: ActiveChildrenList): ChildFormsAction {
    return {type: ChildFormsActions.SET_ACTIVE, formID, payload};
  }

  /* --- Form Refs Actions --- */

  public setFormRefs(formID: FormID, value: any): FormRefsAction {
    return {type: FormRefsActions.SET, formID, value};
  }

  /* --- Form Params Actions --- */

  public setParams(formId: FormID, value: any): FormParamsAction {
    return {type: FormParamsActions.SET, formId, value};
  }
  public addParam(formId: FormID, parameter: any): FormParamsAction {
    return {type: FormParamsActions.ADD, formId, parameter};
  }
  public addParamSet(set: any): FormParamsAction {
    return {type: FormParamsActions.ADD_SET, set};
  }
  public updateParam(formId: FormID, id: ParameterID, value: any, manual: boolean): FormParamsAction {
    return {type: FormParamsActions.UPDATE, formId, id, value, manual};
  }
  public updateParamSet(formId: FormID, values: any): FormParamsAction {
    return {type: FormParamsActions.UPDATE_SET, formId, values};
  }

  /* --- Form Settings Actions --- */

  public setFormSettings(formId, value): FormSettingsAction {
    return {type: FormSettingsActions.SET, formId, value};
  }

  /* --- Form Layout Actions --- */

  public setFormLayout(formID: FormID, layout: any): FormLayoutAction {
    return {type: FormLayoutActions.SET, formID, payload: layout};
  }

  /* --- Layout Actions --- */

  public setPlugins(plugins: PluginsConfig): LayoutAction {
    return {type: LayoutActions.SET_PLUGINS, payload: plugins};
  }
  public setLeftLayout(layout: string[]): LayoutAction {
    return {type: LayoutActions.SET_LEFT_LAYOUT, payload: layout};
  }

  /* --- Charts Actions --- */

  public createChartState(formID: FormID): ChartsAction {
    return {type: ChartsActions.ADD, formID};
  }
  public setChartTooltipVisible(formID: FormID, visible: boolean): ChartsAction {
    return {type: ChartsActions.SET_TOOLTIP_VISIBLE, formID, payload: visible};
  }
  public setSeriesSettings(formID, seriesSettings): ChartsAction {
    return {type: ChartsActions.SET_SERIES_SETTINGS, formID, payload: seriesSettings};
  }

  /* --- Maps Actions --- */

  /** Добавляет в хранилище новую мультикарту. */
  public addMultiMap(formID: FormID, forms: FormID[]): MapsAction {
    return {type: MapsActions.ADD_MULTI_MAP, formID, payload: forms};
  }
  /** Устанавливает значение параметра синхронизации. */
  public setMultiMapSync(formID: FormID, sync: boolean): MapsAction {
    return {type: MapsActions.SET_SYNC, formID, payload: sync};
  }

  /** Добавляет в хранилище состояний карт новую карту. */
  public createMapState(formID: FormID, drawer: MapsDrawer): MapsAction {
    return {type: MapsActions.ADD, formID, drawer};
  }
  /** Начало загрузки карты. */
  public startMapLoad(formID: FormID): MapsAction {
    return {type: MapsActions.START_LOAD, formID};
  }
  /** Устанавливает значение для поля `mapData` при успешной загрузке. */
  public loadMapSuccess(formID: FormID, mapData: any): MapsAction {
    return {type: MapsActions.LOAD_SUCCESS, formID, mapData};
  }
  /** Ошибка при загрузке карты. */
  public loadMapError(formID: FormID): MapsAction {
    return {type: MapsActions.LOAD_ERROR, formID: formID};
  }
  /** Установить функцию, выполняющуюся в конце цикла отрисовки. */
  public setOnDrawEnd(formID: FormID, setter: any): MapsAction {
    return {type: MapsActions.SET_DRAW_END, formID, payload: setter};
  }
  /** Установить какое-либо поле хранилища карты. */
  public setMapField(formID: FormID, field: keyof MapState, payload: any): MapsAction {
    return {type: MapsActions.SET_FIELD, formID, field, payload};
  }
  /** Установить выделенный элемент. */
  public setSelectedElement(formID: FormID, element: MapElement): MapsAction {
    return {type: MapsActions.SET_FIELD, formID, field: 'element', payload: element};
  }
  /** Снять выделение с карты. */
  public clearMapSelect(formID: FormID, elementOnly = true): MapsAction {
    return {type: MapsActions.CLEAR_SELECT, formID, elementOnly};
  }
  /** Установить активный слой карты. */
  public setActiveLayer(formID: FormID, layer: any): MapsAction {
    return {type: MapsActions.SET_FIELD, formID, field: 'activeLayer', payload: layer};
  }
  /** Установить режим. */
  public setEditMode(formID: FormID, mode: number): MapsAction {
    return {type: MapsActions.SET_MODE, formID, payload: mode};
  }
  /** Начать редактирование элемента. */
  public startMapEditing(formID: FormID): MapsAction {
    return {type: MapsActions.START_EDITING, formID};
  }
  /** Применить изменения к элементу. */
  public acceptMapEditing(formID: FormID): MapsAction {
    return {type: MapsActions.ACCEPT_EDITING, formID};
  }
  /** Отменить редактирование элемента карты. */
  public cancelMapEditing(formID: FormID): MapsAction {
    return {type: MapsActions.CANCEL_EDITING, formID};
  }
  /** Перейти в режим создания элемента. */
  public startCreatingElement(formID: FormID): MapsAction {
    return {type: MapsActions.START_CREATING, formID};
  }
  /** Добавить элемент на карту. */
  public createMapElement(formID: FormID, element: MapElement): MapsAction {
    return {type: MapsActions.CREATE_ELEMENT, formID, payload: element};
  }
  /** Выйти из режима создания элемента. */
  public cancelCreatingElement(formID: FormID): MapsAction {
    return {type: MapsActions.CANCEL_CREATING, formID};
  }

  /* --- Presentations Actions --- */

  /** Начало запроса списка презентаций. */
  public fetchPresentationsStart(): PresentationsAction {
    return {type: PresentationsActions.FETCH_START};
  }
  /** Конец запроса списка презентаций. */
  public fetchPresentationsEnd(data: PresentationItem | string): PresentationsAction {
    return {type: PresentationsActions.FETCH_END, data};
  }
  /** Обновление презентаций при смене ID сессии и корневой формы. */
  public changePresentations(sessionID: SessionID, formID: FormID) {
    return {type: PresentationsActions.CHANGE, sessionID, formID};
  }
  /** Выбор презентации из списка. */
  public selectPresentation(item: PresentationItem): PresentationsAction {
    return {type: PresentationsActions.SET_SELECTED, item};
  }

  /* --- Programs Actions --- */

  /** Добавление хранилища программ формы. */
  public addFormPrograms(formID: FormID): ProgramsAction {
    return {type: ProgramsActions.ADD, formID};
  }
  /** Начало запроса списка программ. */
  public fetchProgramsStart(formID: FormID): ProgramsAction {
    return {type: ProgramsActions.FETCH_START, formID};
  }
  /** Завершение успешного запроса программ. */
  public fetchProgramsEndSuccess(formID: FormID, data: ProgramListData): ProgramsAction {
    return {type: ProgramsActions.FETCH_END, formID, data};
  }
  /** Завершение неудачного запроса программ. */
  public fetchProgramsEndError(formID: FormID, data: string): ProgramsAction {
    return {type: ProgramsActions.FETCH_END, formID, data};
  }

  /* --- Reports Actions --- */

  /** Установить репорт. */
  public setReport(operationId: any, value: any): ReportsAction {
    return {type: ReportsActions.SET, operationId, value};
  }
  /** Очистить репорты для презентации. */
  public clearReports(presentationId: any): ReportsAction {
    return {type: ReportsActions.CLEAR, presentationId: presentationId};
  }

  /* --- Session Actions --- */

  /** Установить ID сессии. */
  public setSessionId(value: SessionID): SessionIDAction {
    return {type: SessionIDActions.SET, value};
  }
  /** Установить менеджер сесии. */
  public setSessionManager(value: any): SessionManagerAction {
    return {type: SessionManagerActions.SET, value};
  }

  /* --- Window Data Actions --- */

  public setWindowInfo(text, stackTrace = null, header = null, fileToSaveName = null): WindowDataAction {
    return {type: WindowDataActions.SET_INFO, header, text, stackTrace, fileToSaveName};
  }
  public setWindowWarning(text, stackTrace = null, header = null, fileToSaveName = null): WindowDataAction {
    return {type: WindowDataActions.SET_WARNING, header, text, stackTrace, fileToSaveName};
  }
  public setWindowError(text, stackTrace = null, header = null, fileToSaveName = null): WindowDataAction {
    return {type: WindowDataActions.SET_ERROR, header, text, stackTrace, fileToSaveName};
  }
  public setOpenedWindow(name: string, windowVisible: boolean, window, position = undefined): WindowDataAction {
    return {type: WindowDataActions.SET_OPENED_WINDOW, windowName: name, windowVisible, window, position};
  }
  public closeWindow(): WindowDataAction {
    return {type: WindowDataActions.CLOSE};
  }
  public setWindowNotification(text: any): WindowDataAction {
    return {type: WindowDataActions.SET_NOTIFICATION, text};
  }
  public closeWindowNotification(): WindowDataAction {
    return {type: WindowDataActions.CLOSE_NOTIFICATION};
  }
}
