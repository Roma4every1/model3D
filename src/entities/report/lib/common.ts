import { t } from 'shared/locales';
import { showInfoMessage } from 'entities/window';
import { showNotification } from 'entities/notification';
import { reloadChannelsByQueryIDs, fillChannel } from 'entities/channel';
import { reportAPI } from './report.api';
import { useReportStore } from '../store/report.store';
import { setOperationStatus } from '../store/report.actions';


/** Наблюдает за прогрессом операции, пока она не выполнится. */
export async function watchOperation(report: ReportModel | null, operationID: OperationID): Promise<void> {
  let tabSelected = false;
  while (true) {
    const res = await reportAPI.getOperationStatus(operationID);
    if (!tabSelected) {
      useReportStore.getState().layoutController.showTab('right-dock', 0, true);
      tabSelected = true;
    }
    if (res.ok === false) {
      const message = t('report.get-operation-status-error');
      showNotification({type: 'warning', content: message});
      setOperationStatus({id: operationID, error: res.message}); return;
    }

    const { modifiedTables, log, ready } = res.data;
    if (modifiedTables.length) reloadChannelsByQueryIDs(modifiedTables).then();

    if (log && report) {
      const title = t(`report.${report.type}-result`);
      showInfoMessage(log, title);
    }

    setOperationStatus(res.data);
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

/* --- --- */

/**
 * Обновляет у отчёта указанные каналы.
 * @param report модель отчёта
 * @param names названия каналов, которые нужно обновить, если null, то все
 * @param external внешние параметры (презентации, глобальные)
 */
export function fillReportChannels(
  report: ReportModel, names: ChannelName[] | null,
  external: ParameterMap,
): Promise<void[]> {
  const { channels, parameters } = report;
  if (!names) names = Object.keys(channels);
  const cb = (name: ChannelName) => fillReportChannel(channels[name], parameters, external);
  return Promise.all(names.map(cb));
}

export function fillReportChannel(c: Channel, parameters: Parameter[], map: ParameterMap): Promise<void> {
  const parametersToFill: Parameter[] = [];
  for (const id of c.config.parameters) {
    const parameter = parameters.find(p => p.id === id) ?? map.get(id);
    if (parameter) parametersToFill.push(parameter);
  }
  return fillChannel(c, parametersToFill);
}

/**
 * Функция сравнение моделей процедур для сортировки:
 * 1-ый признак — доступность, 2-ой — порядок, в котором они пришли с сервера.
 */
export function reportCompareFn(a: ReportModel, b: ReportModel): number {
  if (!a.available) return 1;
  if (!b.available) return -1;
  return a.orderIndex - b.orderIndex;
}
