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
  payload: {data: PresentationItem | string, activeID: FormID},
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
const setActive = (items: PresentationItem[], activeID: FormID) => {
  for (const item of items) {
    if (item.items) {
      if (setActive(item.items, activeID)) { item.expanded = true; return; }
    } else if (item.id === activeID) {
      item.selected = true;
      return true;
    }
  }
};

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
      const { data, activeID } = action.payload;
      if (typeof data === 'string') {
        return {...state, loading: false, success: false, data};
      } else {
        setActive(data.items, activeID);
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
