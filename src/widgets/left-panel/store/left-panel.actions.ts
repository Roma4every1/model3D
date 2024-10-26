import { useClientStore } from 'entities/client';
import { useParameterStore } from 'entities/parameter';
import { PresentationTree } from '../lib/presentation-tree';


/** Обновление видимости дерева презентаций. */
export function updatePresentationTree(changes: Set<ParameterID>): void {
  const rootClient = useClientStore.getState().root;
  const tree: PresentationTree = rootClient.settings.presentationTree;

  const parameters = useParameterStore.getState().clients.root;
  const changed = tree.updateVisibility(parameters, changes);
  if (!changed) return;

  tree.updateNodes();
  useClientStore.setState({root: {...rootClient}});
}

export function setLeftLayout(layout: LeftPanelLayout): void {
  const client = useClientStore.getState().root as RootClient;
  client.layout = {...client.layout, left: layout};
  useClientStore.setState({root: {...client}});
}
