import { Dispatch } from 'redux';
import { StateGetter } from 'shared/lib';
import { fillParamValues } from 'entities/parameters';
import { updateTables, fillChannels } from 'entities/channels';
import { showInfoMessage } from 'entities/window';
import { showNotification } from 'entities/notifications';
import { setOperationStatus } from '../store/reports.actions';
import { t } from 'shared/locales';
import { reportsAPI } from './report.api.ts';


/** Наблюдает за прогрессом операции, пока она не выполнится. */
export async function watchOperation(
  report: ReportModel | null, operationID: OperationID,
  dispatch: Dispatch, getState: StateGetter,
) {
  let tabSelected = false;
  while (true) {
    const res = await reportsAPI.getOperationStatus(operationID);
    if (!tabSelected) {
      getState().root.layout.common.showTab('right-dock', 0, true);
      tabSelected = true;
    }
    if (res.ok === false) {
      const message = t('report.get-operation-status-error');
      showNotification({type: 'warning', content: message})(dispatch).then();
      dispatch(setOperationStatus({id: operationID, error: res.data})); return;
    }

    const { modifiedTables, log, ready } = res.data;
    if (modifiedTables.length) updateTables(modifiedTables)(dispatch, getState).then();

    if (log && report) {
      const title = t(`report.${report.type}-result`);
      dispatch(showInfoMessage(log, title));
    }

    dispatch(setOperationStatus(res.data));
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

/* --- --- */

/** Обновляет у отчёта указанные каналы.
 * @param report модель отчёта
 * @param names названия каналов, которые нужно обновить
 * @param rootID ID главной формы
 * @param clientID ID презентации с отчётом
 * @param parameters текущее состояние параметров приложения
 * */
export async function updateReportChannelData(
  report: ReportModel, names: Iterable<ChannelName>,
  rootID: FormID, clientID: FormID, parameters: ParamDict
): Promise<void> {
  const dict: ChannelDict = {};
  for (const name of names) dict[name] = report.channels[name];

  const paramDict: ParamDict = {
    [report.id]: report.parameters,
    [rootID]: parameters[rootID],
    [clientID]: parameters[clientID],
  };
  await fillChannels(dict, paramDict);
}

/* --- --- */

/** Создаёт список программ/отчётов для презентации. */
export async function createReportModels(paramDict: ParamDict, rootID: ClientID, id: ClientID): Promise<ReportModel[]> {
  const res = await reportsAPI.getPresentationReports(id);
  const reportModels = res.ok ? res.data : [];
  if (reportModels.length === 0) return reportModels;

  const clients = [rootID, id];
  const changedReports: Promise<void>[] = [];

  reportModels.forEach((report: ReportModel, i: number) => {
    report.orderIndex = i;
    if (!report.type) report.type = 'report';
    report.availabilityParameters = (report as any).paramsForCheckVisibility;
    delete (report as any).paramsForCheckVisibility;
    if (!report.availabilityParameters) { report.available = true; return; }
    const parameters = fillParamValues(report.availabilityParameters, paramDict, clients);

    for (const parameter of parameters) {
      if (!parameter.relatedReports) parameter.relatedReports = [];
      if (!parameter.relatedReports.includes(report.id)) parameter.relatedReports.push(report.id);
    }
    changedReports.push(applyReportAvailability(report, parameters));
  });
  await Promise.all(changedReports);
  return reportModels.sort(reportCompareFn);
}

export async function applyReportAvailability(report: ReportModel, parameters: Parameter[]): Promise<void> {
  report.available = await reportsAPI.getReportAvailability(report.id, parameters);
}

/**
 * Клонирует глобальный параметр или параметр презентации
 * для подстановки в список параметров процедуры.
 * */
export function cloneReportParameter(parameter: Parameter): Parameter {
  const clone = {...parameter};
  clone.value = structuredClone(parameter.value);
  clone.relatedReports = [];
  delete clone.editor;
  return clone;
}

/**
 * Функция сравнение моделей процедур для сортировки:
 * 1-ый признак — доступность, 2-ой — порядок, в котором они пришли с сервера.
 * */
export function reportCompareFn(a: ReportModel, b: ReportModel): number {
  if (!a.available) return 1;
  if (!b.available) return -1;
  return a.orderIndex - b.orderIndex;
}
