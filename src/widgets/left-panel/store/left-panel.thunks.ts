import { Dispatch } from 'redux';
import { Thunk, StateGetter, forEachTreeLeaf, setIntersection } from 'shared/lib';
import { setPresentationTree } from 'app/store/root-form/root-form.actions';


/** Обновление видимости дерева презентаций.
 * @param updateIDs ID параметров, изменивших значение
 * */
export function updatePresentationTreeVisibility(updateIDs: ParameterID[]): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const tree = state.root.presentationTree;
    const globalParameters = state.parameters[state.root.id];

    const treeItemsToUpdate: PresentationTreeItem[] = [];
    const callback = (item: PresentationTreeItem) => {
      if (!item.visibilityParameters) return;
      const intersection = setIntersection(item.visibilityParameters, updateIDs);
      if (intersection.size) treeItemsToUpdate.push(item);
    };
    forEachTreeLeaf(tree, callback, 'items');

    if (treeItemsToUpdate.length) {
      for (const item of treeItemsToUpdate) {
        const newVisible = item.visibilityHandler(globalParameters);
        if (item.visible !== newVisible) console.log(newVisible, item);
        item.visible = newVisible;
      }
      dispatch(setPresentationTree([...tree]));
    }
  };
}
