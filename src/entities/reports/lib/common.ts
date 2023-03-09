import { Dispatch } from 'redux';
import { t } from 'shared/locales';
import { reportsAPI } from './reports.api';
import { setOperationStatus } from '../store/reports.actions';
import { ParamsGetter, fillParamValues } from 'entities/parameters';
import { updateTables } from '../../channels';
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

/** Создаёт список программ/отчётов для презентации. */
export async function createReportModels(params: ParamDict, rootID: FormID, id: FormID) {
  const res = await reportsAPI.getPresentationReports(id);
  const programs = res.ok ? res.data : [];

  if (programs.length) {
    const paramsGetter: ParamsGetter = (ids) => fillParamValues(ids, params, [rootID, id]);
    const mapper = (program) => getReportVisibility(program, paramsGetter);
    const visibilityList = await Promise.all(programs.map(mapper));
    programs.forEach((program, i) => program.visible = visibilityList[i]);
  }
  return programs;
}

async function getReportVisibility(report: ReportModel, getter: ParamsGetter): Promise<boolean> {
  if (!report.needCheckVisibility) return true;
  const paramValues = getter(report.paramsForCheckVisibility);
  return reportsAPI.getProgramVisibility(report.id, paramValues);
}
