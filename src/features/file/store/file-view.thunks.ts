import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { channelRowToRecord } from 'entities/channels';
import { setFileViewModel } from './file-view.actions';
import { mimeTypeDict } from '../lib/constants';
import { reportsAPI } from 'entities/reports/lib/reports.api';


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
      const fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
      const contentType = mimeTypeDict[fileType] ?? '';

      if (useResources) {
        const res = await reportsAPI.downloadFile(descriptor);
        if (!res.ok) return; // TODO: варнинг
        blob = res.data.slice(0, res.data.size, contentType)
      } else {
        blob = base64toBlob(descriptor, contentType);
      }

      model = {fileName, fileType, data: blob, uri: URL.createObjectURL(blob)};
      memo.push(model);
    } else if (model === oldModel) {
      return;
    }
    dispatch(setFileViewModel(id, model));
  };
}

function base64toBlob(data: string, contentType: string = '', sliceSize: number = 512): Blob {
  const byteCharacters = atob(data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, {type: contentType});
}
