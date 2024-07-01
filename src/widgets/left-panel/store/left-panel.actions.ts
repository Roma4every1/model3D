import { hasIntersection, forEachTreeLeaf } from 'shared/lib';
import { useClientStore } from 'entities/client';
import { useParameterStore } from 'entities/parameter';


/** Обновление видимости дерева презентаций. */
export function updatePresentationTree(changes: Set<ParameterID>): void {
  const tree: PresentationTree = useClientStore.getState().root.settings.presentationTree;
  const treeItemsToUpdate: PresentationTreeItem[] = [];

  const callback = (item: PresentationTreeItem) => {
    if (!item.visibilityString) return;
    const ids = item.visibilityString.parameterIDs;
    if (hasIntersection(changes, ids)) treeItemsToUpdate.push(item);
  };
  forEachTreeLeaf(tree, callback, 'items');

  if (treeItemsToUpdate.length) {
    const parameters = useParameterStore.getState().clients.root;
    for (const item of treeItemsToUpdate) {
      item.visible = Boolean(eval(item.visibilityString.build(parameters)));
    }

    const rootClient = useClientStore.getState().root as RootClient;
    rootClient.settings = {...rootClient.settings, presentationTree: [...tree]};
    useClientStore.setState({root: {...rootClient}});
  }
}

export function setLeftLayout(layout: LeftPanelLayout): void {
  const client = useClientStore.getState().root as RootClient;
  client.layout = {...client.layout, left: layout};
  useClientStore.setState({root: {...client}});
}
