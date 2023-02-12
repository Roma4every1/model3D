import { Dispatch } from 'redux';
import { programsAPI } from './programs.api';
import { setReport } from '../store/reports/reports.actions';
import { ParamsGetter, fillParamValues } from 'entities/parameters';


export function watchReport(operationID: string, dispatch: Dispatch) {
  setTimeout(async function tick() {
    const result = await getReportStatus(operationID, dispatch);
    if (result !== true) setTimeout(tick, 1000);
  }, 1000);
}

async function getReportStatus(operationID, dispatch: Dispatch) {
  const { ok, data } = await programsAPI.getOperationResult(operationID);
  if (ok && data) {
    dispatch(setReport(operationID, data.report));
    return data.isReady;
  } else {
    return true;
  }
}


/** Создаёт список программ/отчётов для презентации. */
export async function createPrograms(params: ParamDict, rootID: FormID, id: FormID) {
  const res = await programsAPI.getProgramsList(id);
  const programs = res.ok ? res.data : [];

  if (programs.length) {
    const paramsGetter: ParamsGetter = (ids) => fillParamValues(ids, params, [rootID, id]);
    const mapper = (program) => getProgramVisibility(program, paramsGetter);
    const visibilityList = await Promise.all(programs.map(mapper));
    programs.forEach((program, i) => program.visible = visibilityList[i]);
  }
  return programs;
}

async function getProgramVisibility(program: ProgramListItem, getter: ParamsGetter): Promise<boolean> {
  if (!program.needCheckVisibility) return true;
  const paramValues = getter(program.paramsForCheckVisibility);
  return programsAPI.getProgramVisibility(program.id, paramValues);
}
