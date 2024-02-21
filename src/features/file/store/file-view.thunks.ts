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
    const fileViewState = state.fileViews[id];
    const flag = ++fileViewState.loadingFlag.current;

    const info = formState.channels[0].columnInfo;
    const record = channelRowToRecord(activeRow, data.columns);
    const fileName: string = record[info.fileName.name];
    let model = fileViewState.memo.find(memoModel => memoModel.fileName === fileName);

    if (model === undefined) {
      model = {fileName, fileType: null, data: null, uri: null, loading: true};
      fileViewState.memo.push(model);
      dispatch(setFileViewModel(id, model));

      const descriptor = record[info.descriptor.name];
      const fileType = getFileExtension(fileName);
      const contentType = mimeTypeDict[fileType] ?? '';

      if (fileViewState.useResources) {
        const res = await reportsAPI.downloadFile(descriptor);
        if (!res.ok) {
          const message = t('file-view.download-error', {fileName});
          dispatch(showWarningMessage(message)); return;
        }
        model.data = res.data.slice(0, res.data.size, contentType)
      } else {
        model.data = base64toBlob(descriptor, contentType);
      }

      model.fileType = fileType;
      model.uri = URL.createObjectURL(model.data);

      const parser = fileParserDict[fileType];
      if (parser) model.content = await parser(model.data);

      model.loading = false;
      const currentModel = getState().fileViews[id].model;
      if (model === currentModel) dispatch(setFileViewModel(id, model)); // rerender
    }
    else if (model === fileViewState.model) {
      return;
    }
    if (fileViewState.loadingFlag.current === flag) dispatch(setFileViewModel(id, model));
  };
}
