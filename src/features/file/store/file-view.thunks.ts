import { t } from 'shared/locales';
import { base64toBlob, getFileExtension } from 'shared/lib';
import { programAPI } from 'entities/program';
import { channelAPI, channelRowToRecord } from 'entities/channel';
import { showWarningMessage } from 'entities/window';
import { setFileViewModel } from './file-view.actions';
import { useFileViewStore } from './file-view.store';
import { mimeTypeDict, fileParserDict } from '../lib/constants';


export async function updateFileViewModel(id: FormID, data: ChannelData): Promise<void> {
  const row = data?.activeRow;
  if (!row) { setFileViewModel(id, null); return; }

  const state = useFileViewStore.getState()[id];
  const flag = ++state.loadingFlag.current;

  if (state.queryID !== data.queryID) {
    state.memo.forEach(m => m.uri && URL.revokeObjectURL(m.uri));
    state.memo = [];
    state.queryID = data.queryID;
  }
  const fileProperty = state.fileProperty;
  let model = state.memo.find(memoModel => memoModel.row === row);

  if (model === undefined) {
    const record = channelRowToRecord(row, data.columns);
    const fileName: string = record[fileProperty.file.nameFrom];

    model = {row, fileName, fileType: null, data: null, uri: null, loading: Boolean(fileName)};
    state.memo.push(model);
    setFileViewModel(id, model);
    if (!fileName) return;

    const fileType = getFileExtension(fileName);
    const contentType = mimeTypeDict[fileType] ?? '';
    const descriptor: string = record[fileProperty.fromColumn];

    if (fileProperty.file.fromResources) {
      const res = await programAPI.downloadFile(descriptor);
      if (!res.ok) {
        const message = t('file-view.download-error', {fileName});
        showWarningMessage(message); return;
      }
      model.data = res.data.slice(0, res.data.size, contentType)
    } else if (descriptor) {
      model.data = base64toBlob(descriptor, contentType);
    } else {
      const rowIndex = data.rows.findIndex(r => r === row);
      const res = await channelAPI.getResource(data.queryID, rowIndex, fileProperty.fromColumn);

      if (!res.ok) {
        const message = t('file-view.download-error', {fileName});
        showWarningMessage(message); return;
      }
      model.data = res.data.slice(0, res.data.size, contentType);
    }

    model.fileType = fileType;
    model.uri = URL.createObjectURL(model.data);

    const parser = fileParserDict[fileType];
    if (parser) model.content = await parser(model.data);

    model.loading = false;
    const currentModel = useFileViewStore.getState()[id].model;
    if (model === currentModel) setFileViewModel(id, model); // rerender
  }
  else if (model === state.model) {
    return;
  }
  if (state.loadingFlag.current === flag) setFileViewModel(id, model);
}
