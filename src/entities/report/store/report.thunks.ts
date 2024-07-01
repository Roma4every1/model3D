import { t } from 'shared/locales';
import { hasIntersection } from 'shared/lib';
import { showNotification } from 'entities/notification';
import { showInfoMessage, showWarningMessage } from 'entities/window';
import { reloadChannelsByQueryIDs } from 'entities/channel';
import { useParameterStore, findParameters, rowToParameterValue } from 'entities/parameter';
import { useReportStore } from './report.store';
import { reportAPI } from '../lib/report.api';
import { reportCompareFn, fillReportChannels, watchOperation } from '../lib/common';


/** Обновление доступности программ и отчётов. */
export async function updateReports(client: ClientID, reports: ReportModel[]): Promise<void> {
  const models = useReportStore.getState().models;
  const storage = useParameterStore.getState().storage;

  await Promise.all(reports.map(async (report: ReportModel): Promise<void> => {
    const parameters = findParameters(report.availabilityParameters, storage);
    report.available = await reportAPI.getReportAvailability(report.id, parameters);
  }));

  const clientReports = models[client].toSorted(reportCompareFn);
  useReportStore.setState({models: {...models, [client]: clientReports}});
}

/** Запуска процедуры. */
export async function runReport(report: ReportModel): Promise<void> {
  const reportID = report.id;
  const parameters = report.parameters;

  for (let i = 0; i < report.linkedPropertyCount; ++i) {
    const res = await reportAPI.executeReportProperty(reportID, parameters, i);
    if (res.ok === false) { showWarningMessage(res.message); continue; }
    if (res.data.error) { showWarningMessage(res.data.error); continue; }

    const { operationID, result, modifiedTables } = res.data;
    if (modifiedTables.length) reloadChannelsByQueryIDs(modifiedTables).then();

    if (result) {
      const title = t(`report.${report.type}-result`);
      const style = {whiteSpace: 'pre', maxWidth: 400, maxHeight: 300};
      showInfoMessage(result, title, style);
    }
    if (operationID) {
      showNotification(t('report.start', {name: report.displayName}));
      await watchOperation(report, operationID);
    }
  }
  for (const parameter of parameters) {
    if (parameter.editor?.type !== 'fileTextEditor') parameter.setValue(null);
  }
}

/* --- --- */

/** Подготовка процедуры перед открытием диалога. */
export async function prepareReport(report: ReportModel): Promise<void> {
  const storage = useParameterStore.getState().storage;
  const changes = handleReportRelations(report, storage);

  const names: ChannelName[] = [];
  const channels = Object.values(report.channels);

  for (const { name, config, actual } of channels) {
    if (!actual || hasIntersection(changes, config.parameters)) names.push(name);
  }
  if (names.length) {
    await fillReportChannels(report, names, storage);
  }
  if (changes.size) {
    prepareReportParameters(report, changes);
    report.runnable = await reportAPI.canRunReport(report.id, report.parameters);
  }
}

/**
 * Если в процедуре пользователь ни разу не трогал значение клонированного
 * параметра, то при открытии диалога его значение должно совпадать
 * со значением соответствующего параметра системы.
 */
function handleReportRelations(report: ReportModel, storage: ParameterMap): Set<ParameterID> {
  const changes: Set<ParameterID> = new Set();
  const { relations, checkRelations, parameters } = report;

  if (!checkRelations || relations.size === 0) return changes;
  report.checkRelations = false;

  for (const parameter of parameters) {
    const relatedID = relations.get(parameter.id);
    if (relatedID === undefined) continue;

    const newValue = storage.get(relatedID).getValue();
    parameter.setValue(structuredClone(newValue));
    changes.add(parameter.id);
  }
  return changes;
}

function prepareReportParameters(report: ReportModel, changes: Set<ParameterID>): void {
  const { parameters, channels } = report;
  const dependents: Set<ParameterID> = new Set();

  for (const p of parameters) {
    if (!changes.has(p.id)) continue;
    for (const dep of p.dependents) dependents.add(dep);
  }
  for (const p of parameters) {
    if (dependents.has(p.id) && !changes.has(p.id)) {
      if (p.nullable === false && p.channelName && p.type === 'tableRow') {
        const channel = channels[p.channelName];
        const row = channel?.data?.rows?.at(0);
        if (row) { p.setValue(rowToParameterValue(row, channel)); continue; }
      }
      if (p.getValue() !== null) p.setValue(null);
    }
  }
}
