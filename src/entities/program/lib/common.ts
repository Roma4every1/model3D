import { t } from 'shared/locales';
import { sleep } from 'shared/lib';
import { showInfoMessage } from 'entities/window';
import { showNotification } from 'entities/notification';
import { reloadChannelsByQueryIDs, fillChannel } from 'entities/channel';
import { programAPI } from './program.api';
import { useProgramStore } from '../store/program.store';
import { setOperationStatus } from '../store/program.actions';


/** Наблюдает за прогрессом операции, пока она не выполнится. */
export async function watchOperation(id: OperationID, program?: Program): Promise<void> {
  let tabSelected = false;
  while (true) {
    const res = await programAPI.getOperationStatus(id);
    if (!tabSelected) {
      useProgramStore.getState().layoutController.showTab('right-dock', 0, true);
      tabSelected = true;
    }
    if (res.ok === false) {
      showNotification({type: 'warning', content: t('operation.status-error')});
      setOperationStatus({id: id, error: res.message}); return;
    }

    const { modifiedTables, log, ready } = res.data;
    if (modifiedTables.length) reloadChannelsByQueryIDs(modifiedTables).then();

    if (log && program) {
      const title = t(`program.${program.type}-result`);
      showInfoMessage(log, title);
    }

    setOperationStatus(res.data);
    if (ready) return;
    await sleep(1500);
  }
}

/* --- --- */

/**
 * Обновляет у программы указанные каналы.
 * @param p модель программы
 * @param ids ID каналов, которые нужно обновить, если null, то все
 * @param external внешние параметры (презентации, глобальные)
 */
export function fillProgramChannels(p: Program, ids: ChannelID[], external: ParameterMap): Promise<void[]> {
  const { channels, parameters } = p;
  const cb = (id: ChannelID) => fillProgramChannel(channels[id], parameters, external);
  return Promise.all(ids.map(cb));
}

export function fillProgramChannel(c: Channel, parameters: Parameter[], map: ParameterMap): Promise<void> {
  const parametersToFill: Parameter[] = [];
  for (const id of c.config.parameters) {
    const parameter = parameters.find(p => p.id === id) ?? map.get(id);
    if (parameter) parametersToFill.push(parameter);
  }
  return fillChannel(c, parametersToFill);
}

/**
 * Функция сравнения программ для сортировки:
 * 1-ый признак — доступность,
 * 2-ой — порядок, в котором они пришли с сервера.
 */
export function programCompareFn(a: Program, b: Program): number {
  if (!a.available) return 1;
  if (!b.available) return -1;
  return a.orderIndex - b.orderIndex;
}
