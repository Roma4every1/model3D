/* --- Action Types --- */

import { createColumnInfo } from '../../../entities/channels';


export enum FileListActionType {
  CREATE = 'fileList/create',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: FileListActionType.CREATE;
  payload: FormStatePayload;
}

export type FileListAction = ActionCreate;

/* --- Init State & Reducer --- */

const init: FileListStates = {};

export function fileListReducer(state: FileListStates = init, action: FileListAction): FileListStates {
  switch (action.type) {

    case FileListActionType.CREATE: {
      const { state: formState, channels } = action.payload;
      let info: ChannelColumnInfo = null;
      const criterion: ChannelCriterion = {fileName: 'FILE', filePath: 'PATH'};

      for (const attachedChannel of formState.channels) {
        const channel = channels[attachedChannel.name];
        info = createColumnInfo(channel, criterion);
        if (info) { attachedChannel.columnInfo = info; break; }
      }
      return {...state, [formState.id]: {activeFile: null}};
    }

    default: return state;
  }
}
