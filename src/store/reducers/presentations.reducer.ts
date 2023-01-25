/* --- Action Types --- */

export enum PresentationsActions {
  SET = 'presentations/set',
  SET_SELECTED = 'presentations/select',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: PresentationsActions.SET,
  payload: {data: PresentationItem[], activeID: FormID},
}
interface ActionSetSelected {
  type: PresentationsActions.SET_SELECTED,
  payload: PresentationItem,
}

export type PresentationsAction = ActionSet | ActionSetSelected;

/* --- Reducer Utils --- */

const clearSelect = (items: PresentationItem[]) => {
  items.forEach(item => {
    item.items ? clearSelect(item.items) : item.selected = false;
  });
};
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

/* --- Init State & Reducer --- */

const init: PresentationsState = [];

export const presentationsReducer = (state: PresentationsState = init, action: PresentationsAction): PresentationsState => {
  switch (action.type) {

    case PresentationsActions.SET: {
      const { data, activeID } = action.payload;
      setActive(data, activeID);
      return data;
    }

    case PresentationsActions.SET_SELECTED: {
      clearSelect(state);
      action.payload.selected = true;
      return [...state];
    }

    default: return state;
  }
};
