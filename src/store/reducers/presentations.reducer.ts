/* --- actions types --- */

export enum PresentationsActions {
  FETCH_START = 'presentations/start',
  FETCH_END = 'presentations/end',
  CHANGE = 'presentations/change',
  SET_SELECTED = 'presentations/set',
}

/* --- actions interfaces --- */

interface ActionFetchStart {
  type: PresentationsActions.FETCH_START,
}
interface ActionFetchEnd {
  type: PresentationsActions.FETCH_END,
  data: PresentationItem | string,
}
interface ActionChange {
  type: PresentationsActions.CHANGE,
  sessionID: SessionID,
  formID: FormID
}
interface ActionSetSelected {
  type: PresentationsActions.SET_SELECTED,
  item: PresentationItem,
}

export type PresentationsAction = ActionChange | ActionFetchStart | ActionFetchEnd | ActionSetSelected;

/* --- reducer --- */

const clearSelect = (items: PresentationItem[]) => {
  items.forEach(item => {
    item.items ? clearSelect(item.items) : item.selected = false;
  });
}

const init: PresentationsState = {
  loading: false, success: undefined, data: null,
  sessionID: null, formID: null
};

export const presentationsReducer = (state: PresentationsState = init, action: PresentationsAction): PresentationsState => {
  switch (action.type) {

    case PresentationsActions.FETCH_START: {
      return {...state, loading: true, success: undefined, data: null};
    }

    case PresentationsActions.FETCH_END: {
      const data = action.data;
      if (typeof data === 'string') {
        return {...state, loading: false, success: false, data};
      } else {
        return {...state, loading: false, success: true, data};
      }
    }

    case PresentationsActions.CHANGE: {
      const { sessionID, formID } = action;
      return {...init, sessionID, formID};
    }

    case PresentationsActions.SET_SELECTED: {
      if (typeof state.data === 'string') return state;
      const item = action.item;
      clearSelect(state.data.items);
      item.selected = true;
      return {...state};
    }

    default: return state;
  }
}
