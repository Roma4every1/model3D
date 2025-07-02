import { t } from 'shared/locales';
import { showWarningMessage } from 'entities/window';
import { showNotification } from 'entities/notification';
import { programAPI, watchOperation } from 'entities/program';
import { useChartStore } from './chart.store';
import { buildChartExportXML } from '../lib/excel-builder';


export async function exportChartToExcel(formID: FormID, parentID: ClientID): Promise<void> {
  const state = useChartStore.getState()[formID];
  const image = dataURLToArrayBuffer(await state.getPng());

  const resUpload = await programAPI.uploadFile('chart.png', image);
  if (!resUpload.ok) return showWarningMessage(resUpload.message);

  const programID = parentID + ':chart-excel-export';
  const xml = buildChartExportXML(state, resUpload.data);

  const res = await programAPI.exportChartExcel(programID, xml);
  if (!res.ok) return showWarningMessage(res.message);

  const { operationID, error } = res.data;
  if (error) return showWarningMessage(error);
  if (!operationID) return showWarningMessage(t('chart.excel-report-error'));

  showNotification(t('program.start', {name: t('chart.excel-report-name')}));
  await watchOperation(operationID);
}

function dataURLToArrayBuffer(dataURL: string): ArrayBuffer {
  const base64 = dataURL.split(',')[1];
  const binary = window.atob(base64);
  const len = binary.length;
  const buffer = new ArrayBuffer(len);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}
