import { usePresentationStore } from './presentation.store';
import { getChildrenTypes } from '../lib/utils';


/** Установить состояние презентации. */
export function setPresentationState(state: PresentationState): void {
  usePresentationStore.setState({[state.id]: state});
}

/** Установить список дочерних форм. */
export function setPresentationChildren(id: ClientID, children: FormDataWM[]): void {
  const openedChildren = children.map(child => child.id);
  const childrenTypes = getChildrenTypes(children, openedChildren);
  const activeChildID = children[0]?.id;

  const state = usePresentationStore.getState()[id];
  const newState = {...state, children, openedChildren, activeChildID, childrenTypes};
  usePresentationStore.setState({[id]: newState})
}

/** Установить активную форму для презентации. */
export function setActiveForm(id: FormID, activeChildID: FormID): void {
  const state = usePresentationStore.getState()[id];
  if (state.activeChildID === activeChildID) return;
  usePresentationStore.setState({[id]: {...state, activeChildID}});
}
