import { Dispatch } from 'redux';
import { StateGetter } from 'shared/lib';
import { fillParamValues } from 'entities/parameters';
import { updateTables, fillChannels } from 'entities/channels';
import { showInfoMessage } from 'entities/window';
import { setOperationStatus } from '../store/reports.actions';
import { t } from 'shared/locales';
import { reportsAPI } from './report.api.ts';


/** Наблюдает за прогрессом операции, пока она не выполнится. */
export async function watchOperation(
  report: ReportModel | null, operationID: OperationID,
  dispatch: Dispatch, getState: StateGetter,
) {
  while (true) {
    const status = await reportsAPI.getOperationStatus(operationID);
    if (!status) return;

    const { modifiedTables, log } = status;
    if (modifiedTables.length) updateTables(modifiedTables)(dispatch, getState).then();

    if (log && report) {
      const title = t(`report.${report.type}-result`);
      dispatch(showInfoMessage(log, title));
    }

    dispatch(setOperationStatus(status));
    if (status.ready) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
export async function createReportModels(paramDict: ParamDict, rootID: ClientID, id: ClientID) {
  const res = await reportsAPI.getPresentationReports(id);
  const reportModels = res.ok ? res.data : [];
  if (reportModels.length === 0) return reportModels;

  const clients = [rootID, id];
  const changedReports: Promise<void>[] = [];

  for (const report of reportModels) {
    if (!report.type) report.type = 'report';
    if (!report.paramsForCheckVisibility) { report.visible = true; continue; }
    const parameters = fillParamValues(report.paramsForCheckVisibility, paramDict, clients);

    for (const parameter of parameters) {
      if (!parameter.relatedReports) parameter.relatedReports = [];
      if (!parameter.relatedReports.includes(report.id)) parameter.relatedReports.push(report.id);
    }
    changedReports.push(applyReportVisibility(report, parameters));
  }
  await Promise.all(changedReports);
  return reportModels;
}

export async function applyReportVisibility(report: ReportModel, parameters: Parameter[]) {
  report.visible = await reportsAPI.getProgramVisibility(report.id, parameters);
}
