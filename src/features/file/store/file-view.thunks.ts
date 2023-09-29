import { Dispatch } from 'redux';
import { Thunk, StateGetter, base64toBlob, getFileExtension } from 'shared/lib';
import { channelRowToRecord } from 'entities/channels';
import { showWarningMessage } from 'entities/window';
import { setFileViewModel } from './file-view.actions';
import { t } from 'shared/locales';
import { mimeTypeDict, fileParserDict } from '../lib/constants';
import { reportsAPI } from 'entities/reports/lib/report.api.ts';


export function updateFileViewModel(id: FormID, data: ChannelData): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const activeRow = data?.activeRow;
    if (!activeRow) { dispatch(setFileViewModel(id, null)); return; }

    const state = getState();
    const formState = state.forms[id];
    const { model: oldModel, memo, useResources } = state.fileViews[id];

    const info = formState.channels[0].columnInfo;
    const record = channelRowToRecord(activeRow, data.columns);
    const fileName: string = record[info.fileName.name];
    let model = memo.find(memoModel => memoModel.fileName === fileName);

    if (model === undefined) {
      let blob: Blob;
      const descriptor = record[info.descriptor.name];
      const fileType = getFileExtension(fileName);
      const contentType = mimeTypeDict[fileType] ?? '';

      if (useResources) {
        const res = await reportsAPI.downloadFile(descriptor);
        if (!res.ok) {
          const message = t('file-view.download-error', {fileName});
          dispatch(showWarningMessage(message)); return;
        }
        blob = res.data.slice(0, res.data.size, contentType)
      } else {
        blob = base64toBlob(descriptor, contentType);
      }

      model = {fileName, fileType, data: blob, uri: URL.createObjectURL(blob)};
      memo.push(model);

      const parser = fileParserDict[fileType];
      if (parser) model.content = await parser(blob);
    } else if (model === oldModel) {
      return;
    }
    dispatch(setFileViewModel(id, model));
  };
}
