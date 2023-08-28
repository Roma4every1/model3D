/* --- Action Types --- */

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

      for (const attachedChannel of formState.channels) {
        const properties = channels[attachedChannel.name].info.properties;
        const property = properties.find(p => p.file);
        if (!property) continue;

        const nameFrom = property.file.nameFrom;
        const nameProperty = properties.find(p => p.name === nameFrom);
        if (!nameProperty) continue;

        attachedChannel.columnInfo = {
          fileName: {name: nameProperty.fromColumn, index: -1}, // name
          descriptor: {name: property.fromColumn, index: -1},   // data or path
        };
        formState.channels = [attachedChannel];
        break;
      }
      return {...state, [formState.id]: {}};
    }

    default: return state;
  }
}
