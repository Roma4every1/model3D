import { IJsonModel } from "flexlayout-react";
import { AppStateAction, AppStateActions } from "./reducers/app-state.reducer";
import { CanRunReportAction, CanRunReportActions } from "./reducers/can-run-report.reducer";
import { ChannelsDataAction, ChannelsDataActions } from "./reducers/channels-data.reducer";
import { ChannelsLoadingAction, ChannelsLoadingActions } from "./reducers/channels-loading.reducer";
import { ChildFormsAction, ChildFormsActions } from "./reducers/child-forms.reducer";
import { FormRefsAction, FormRefsActions } from "./reducers/form-refs.reducer";
import { FormParamsAction, FormParamsActions } from "./reducers/form-params.reducer";
import { FormSettingsAction, FormSettingsActions } from "./reducers/form-settings.reducer";
import { FormLayoutAction, FormLayoutActions } from "./reducers/form-layout.reducer";
import { LayoutAction, LayoutActions } from "./reducers/layout.reducer";
import { MapsAction, MapsActions } from "./reducers/maps.reducer";
import { PresentationsAction, PresentationsActions } from "./reducers/presentations.reducer";
import { ProgramsAction, ProgramsActions } from "./reducers/programs.reducer";
import { ReportsAction, ReportsActions } from "./reducers/reports.reducer";
import { SessionManagerAction, SessionManagerActions } from "./reducers/session-manager.reducer";
import { WindowDataAction, WindowDataActions } from "./reducers/window-data.reducer";
import { CaratsAction, CaratsActions } from "./reducers/carats.reducer";


export class WellManagerActionsCreator {
  /* --- App State Actions --- */

  /** Установить клиентскую конфигурацию. */
  public setInitResult(config: ClientConfiguration, systemList: SystemList | null): AppStateAction {
    return {type: AppStateActions.INIT_RESULT, payload: {config, systemList}};
  }
  /** Начало загрузки новой сессии. */
  public fetchSessionStart(): AppStateAction {
    return {type: AppStateActions.FETCH_SESSION_START};
  }
  /** Конец загрузки новой сессии. */
  public fetchSessionEnd(res: {ok: boolean, data: string, rootFormID?: string}): AppStateAction {
    return {type: AppStateActions.FETCH_SESSION_END, payload: res};
  }
  /** Очистить хранилище сесиии. */
  public clearSession(): AppStateAction {
    return {type: AppStateActions.CLEAR_SESSION_ID};
  }
  /** Установить новую систему. */
  public setSystemName(systemName: SystemID): AppStateAction {
    return {type: AppStateActions.SET_SYSTEM_ID, payload: systemName};
  }

  /* --- Can Run Report Actions --- */

  public setCanRunReport(value: CanRunReport): CanRunReportAction {
    return {type: CanRunReportActions.SET, value};
  }

  /* --- Carats Actions --- */

  /** Добавляет в хранилище состояний каротажа новую каротажную форму. */
  public createCaratState(formID: FormID): CaratsAction {
    return {type: CaratsActions.ADD, formID};
  }
  /** Установить элемент холста. */
  public setCaratCanvas(formID: FormID, canvas: HTMLCanvasElement): CaratsAction {
    return {type: CaratsActions.SET_CANVAS, formID, payload: canvas};
  }
  /** Установить отрисовщик каротажа. */
  public setCaratDrawer(formID: FormID, drawer: ICaratDrawer): CaratsAction {
    return {type: CaratsActions.SET_DRAWER, formID, payload: drawer};
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

  public setParams(formID: FormID, value: any): FormParamsAction {
    return {type: FormParamsActions.SET, formID, value};
  }
  public addParam(formID: FormID, parameter: FormParameter): FormParamsAction {
    return {type: FormParamsActions.ADD, formID, parameter};
  }
  public addParamSet(set: any): FormParamsAction {
    return {type: FormParamsActions.ADD_SET, set};
  }
  public updateParam(formID: FormID, id: ParameterID, value: any): FormParamsAction {
    return {type: FormParamsActions.UPDATE, formID, id, value};
  }
  public updateParamSet(formID: FormID, values: any): FormParamsAction {
    return {type: FormParamsActions.UPDATE_SET, formID, values};
  }

  /* --- Form Settings Actions --- */

  public setFormSettings(formID: FormID, value: FormSettings): FormSettingsAction {
    return {type: FormSettingsActions.SET, formID, value};
  }
  public setSettingsField(formID: FormID, field: string, value: any): FormSettingsAction {
    return {type: FormSettingsActions.SET_FIELD, formID, field, value};
  }

  /* --- Form Layout Actions --- */

  public setFormLayout(formID: FormID, layout: IJsonModel): FormLayoutAction {
    return {type: FormLayoutActions.SET, formID, payload: layout};
  }

  /* --- Layout Actions --- */

  /** Установить принудительную высоту влкадки в левой панели. */
  public setLeftTabHeight(tab: keyof LeftPanelLayout, height: number): LayoutAction {
    return {type: LayoutActions.SET_LEFT_TAB_HEIGHT, payload: {tab, height}};
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

  /** Конец запроса списка презентаций. */
  public setPresentations(data: PresentationItem[], activeID: FormID): PresentationsAction {
    return {type: PresentationsActions.SET, payload: {data, activeID}};
  }
  /** Выбор презентации из списка. */
  public selectPresentation(item: PresentationItem): PresentationsAction {
    return {type: PresentationsActions.SET_SELECTED, payload: item};
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

  /* --- Session Manager Actions --- */

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
