import { Dispatch } from 'redux';
import { t } from 'shared/locales';
import { reportsAPI } from './reports.api';
import { setOperationStatus } from '../store/reports.actions';
import { fillParamValues } from 'entities/parameters';
import { updateTables, fillChannels } from '../../channels';
import { setWindowInfo } from '../../windows';


export function watchReport(report: ReportModel, operationID: OperationID, dispatch: Dispatch<any>) {
  async function tick() {
    const { ok, data } = await reportsAPI.getOperationResult(operationID);
    if (!ok || !data) return;

    const modifiedTables = data?.report?.ModifiedTables?.ModifiedTables ?? [];
    if (modifiedTables.length) dispatch(updateTables(modifiedTables));

    if (data?.reportLog && report) {
      const text = data.reportLog;
      const fileName = report.displayName + '.log';
      dispatch(setWindowInfo(text, null, t('report.result'), fileName));
    }

    dispatch(setOperationStatus(convertOperationStatus(data.report)));
    if (data.isReady === false) setTimeout(tick, 1000);
  }
  tick();
}

/** Конвертирует ответ сервера в подготовленный вид. */
function convertOperationStatus(raw: ReportStatus): OperationStatus {
  let file: OperationFile | null = null;
  if (raw.Path) {
    const name = raw.Path?.split('\\').pop().split('/').pop()
    file = {name, path: raw.Path, extension: name.split('.').pop()};
  }
  return {
    id: raw.Id, clientID: raw.ID_PR,
    queueNumber: raw.Ord, progress: raw.Progress, timestamp: new Date(raw.Dt),
    file, description: raw.Comment, defaultResult: raw.DefaultResult, error: raw.Error,
  };
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
export async function createReportModels(params: ParamDict, rootID: FormID, id: FormID) {
  const res = await reportsAPI.getPresentationReports(id);
  const reportModels = res.ok ? res.data : [];
  if (reportModels.length === 0) return reportModels;

  const clients = [rootID, id];
  const changedReports: Promise<void>[] = [];

  for (const report of reportModels) {
    if (!report.needCheckVisibility) { report.visible = true; continue; }
    const parameters = fillParamValues(report.paramsForCheckVisibility, params, clients);

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
