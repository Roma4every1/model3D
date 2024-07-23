import { t } from 'shared/locales';
import { hasIntersection } from 'shared/lib';
import { showNotification } from 'entities/notification';
import { showInfoMessage, showWarningMessage } from 'entities/window';
import { reloadChannelsByQueryIDs } from 'entities/channel';
import { useParameterStore, findParameters, rowToParameterValue } from 'entities/parameter';
import { useProgramStore } from './program.store';
import { programAPI } from '../lib/program.api';
import { programCompareFn, fillProgramChannels, watchOperation } from '../lib/common';


/** Обновление доступности программ. */
export async function updatePrograms(client: ClientID, programs: Program[]): Promise<void> {
  const models = useProgramStore.getState().models;
  const storage = useParameterStore.getState().storage;

  await Promise.all(programs.map(async (program: Program): Promise<void> => {
    const parameters = findParameters(program.availabilityParameters, storage);
    program.available = await programAPI.getProgramAvailability(program.id, parameters);
  }));

  const clientReports = models[client].toSorted(programCompareFn);
  useProgramStore.setState({models: {...models, [client]: clientReports}});
}

/** Запуск серверной программы. */
export async function runProgram(program: Program): Promise<void> {
  const reportID = program.id;
  const parameters = program.parameters;

  for (let i = 0; i < program.linkedPropertyCount; ++i) {
    const res = await programAPI.executeReportProperty(reportID, parameters, i);
    if (res.ok === false) { showWarningMessage(res.message); continue; }
    if (res.data.error) { showWarningMessage(res.data.error); continue; }

    const { operationID, result, modifiedTables } = res.data;
    if (modifiedTables.length) reloadChannelsByQueryIDs(modifiedTables).then();

    if (result) {
      const title = t(`program.${program.type}-result`);
      const style = {whiteSpace: 'pre', maxWidth: 400, maxHeight: 300};
      showInfoMessage(result, title, style);
    }
    if (operationID) {
      showNotification(t('program.start', {name: program.displayName}));
      await watchOperation(operationID, program);
    }
  }
  for (const parameter of parameters) {
    if (parameter.editor?.type === 'fileTextEditor') parameter.setValue(null);
  }
}

/* --- --- */

/** Подготовка программы перед открытием диалога. */
export async function prepareProgram(program: Program): Promise<void> {
  const storage = useParameterStore.getState().storage;
  const changes = handleProgramRelations(program, storage);

  const ids: ChannelID[] = [];
  const channels = Object.values(program.channels);

  for (const { id, config, actual } of channels) {
    if (!actual || hasIntersection(changes, config.parameters)) ids.push(id);
  }
  if (ids.length) {
    await fillProgramChannels(program, ids, storage);
  }
  if (changes.size) {
    prepareProgramParameters(program, changes);
    program.runnable = await programAPI.canRunProgram(program.id, program.parameters);
  }
}

/**
 * Если в процедуре пользователь ни разу не трогал значение клонированного
 * параметра, то при открытии диалога его значение должно совпадать
 * со значением соответствующего параметра системы.
 */
function handleProgramRelations(program: Program, storage: ParameterMap): Set<ParameterID> {
  const changes: Set<ParameterID> = new Set();
  const { relations, checkRelations, parameters } = program;

  if (!checkRelations || relations.size === 0) return changes;
  program.checkRelations = false;

  for (const parameter of parameters) {
    const relatedID = relations.get(parameter.id);
    if (relatedID === undefined) continue;

    const newValue = storage.get(relatedID).getValue();
    parameter.setValue(structuredClone(newValue));
    changes.add(parameter.id);
  }
  return changes;
}

function prepareProgramParameters(program: Program, changes: Set<ParameterID>): void {
  const { parameters, channels } = program;
  const dependents: Set<ParameterID> = new Set();

  for (const p of parameters) {
    if (!changes.has(p.id)) continue;
    for (const dep of p.dependents) dependents.add(dep);
  }
  for (const p of parameters) {
    if (dependents.has(p.id) && !changes.has(p.id)) {
      if (p.nullable === false && p.channelID && p.type === 'tableRow') {
        const channel = channels[p.channelID];
        const row = channel?.data?.rows?.at(0);
        if (row) { p.setValue(rowToParameterValue(row, channel)); continue; }
      }
      if (p.getValue() !== null) p.setValue(null);
    }
  }
}
