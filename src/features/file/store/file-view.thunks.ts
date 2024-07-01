import { base64toBlob, getFileExtension } from 'shared/lib';
import { useClientStore } from 'entities/client';
import { channelRowToRecord, channelAPI } from 'entities/channel';
import { showWarningMessage } from 'entities/window';
import { setFileViewModel } from './file-view.actions';
import { t } from 'shared/locales';
import { mimeTypeDict, fileParserDict } from '../lib/constants';
import { reportAPI } from 'entities/report/lib/report.api';
import { useFileViewStore } from './file-view.store';


export async function updateFileViewModel(id: FormID, data: ChannelData): Promise<void> {
  const activeRow = data?.activeRow;
  if (!activeRow) { setFileViewModel(id, null); return; }

  const formState = useClientStore.getState()[id];
  const fileViewState = useFileViewStore.getState()[id];
  const flag = ++fileViewState.loadingFlag.current;

  const attachedChannel = formState.channels[0];
  const fileColumnName = attachedChannel.info.descriptor.columnName;

  const record = channelRowToRecord(activeRow, data.columns);
  const fileName: string = record[attachedChannel.info.fileName.columnName];
  let model = fileViewState.memo.find(memoModel => memoModel.fileName === fileName);

  if (model === undefined) {
    model = {fileName, fileType: null, data: null, uri: null, loading: true};
    fileViewState.memo.push(model);
    setFileViewModel(id, model);

    const descriptor = record[fileColumnName];
    const fileType = getFileExtension(fileName);
    const contentType = mimeTypeDict[fileType] ?? '';

    if (fileViewState.useResources) {
      const res = await reportAPI.downloadFile(descriptor);
      if (!res.ok) {
        const message = t('file-view.download-error', {fileName});
        showWarningMessage(message); return;
      }
      model.data = res.data.slice(0, res.data.size, contentType)
    } else if (descriptor) {
      model.data = base64toBlob(descriptor, contentType);
    } else {
      const rowIndex = data.rows.findIndex(r => r === activeRow);
      const res = await channelAPI.getResource(data.queryID, rowIndex, fileColumnName);

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
  else if (model === fileViewState.model) {
    return;
  }
  if (fileViewState.loadingFlag.current === flag) setFileViewModel(id, model);
}
