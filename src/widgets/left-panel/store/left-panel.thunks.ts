import { forEachTreeLeaf, setIntersection } from 'shared/lib';
import { setPresentationTree } from 'app/store/root-form.actions';
import { useRootStore } from 'app/store/root-form.store';
import { useParameterStore } from 'entities/parameter';


/** Обновление видимости дерева презентаций.
 * @param updateIDs ID параметров, изменивших значение
 * */
export function updatePresentationTreeVisibility(updateIDs: ParameterID[]): void {
  const tree = useRootStore.getState().settings.presentationTree;
  const treeItemsToUpdate: PresentationTreeItem[] = [];

  const callback = (item: PresentationTreeItem) => {
    if (!item.visibilityString) return;
    const intersection = setIntersection(item.visibilityString.parameterIDs, updateIDs);
    if (intersection.size) treeItemsToUpdate.push(item);
  };
  forEachTreeLeaf(tree, callback, 'items');

  if (treeItemsToUpdate.length) {
    const globalParameters = useParameterStore.getState().root;
    const values: Record<string, Parameter> = {};
    for (const p of globalParameters) values[p.id] = p;

    for (const item of treeItemsToUpdate) {
      item.visible = Boolean(eval(item.visibilityString.build(values)));
    }
    setPresentationTree([...tree]);
  }
}
