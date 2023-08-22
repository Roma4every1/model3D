import { createColumnInfo } from 'entities/channels';

/* --- Action Types --- */

export enum FileViewActionType {
  CREATE = 'file/create',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: FileViewActionType.CREATE;
  payload: FormStatePayload;
}

export type FileViewAction = ActionCreate;

/* --- Init State & Reducer --- */

const init: FileViewStates = {};

export function fileViewReducer(state: FileViewStates = init, action: FileViewAction): FileViewStates {
  switch (action.type) {

    case FileViewActionType.CREATE: {
      const { state: formState, channels } = action.payload;
      let info: ChannelColumnInfo = null;
      const criterion: ChannelCriterion = {fileName: 'FILE', filePath: 'PATH'};

      for (const name of formState.channels) {
        const channel = channels[name];
        info = createColumnInfo(channel, criterion);
        if (info) { channel.info.columns = info; break; }
      }
      return {...state, [formState.id]: {info}};
    }

    default: return state;
  }
}
