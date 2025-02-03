import { useClientStore } from './client.store';


export function addSessionClient(client: SessionClient): void {
  useClientStore.setState({[client.id]: client});
}

export function addSessionClients(clients: ClientStates): void {
  useClientStore.setState(clients);
}

export function setClientChildren(id: ClientID, children: FormDataWM[]): void {
  const openedChildren = new Set(children.map(child => child.id));
  const childrenTypes = new Set(children.map(child => child.type));
  const activeChildID = children[0]?.id;

  const state = useClientStore.getState()[id];
  const newState = {...state, children, openedChildren, activeChildID, childrenTypes};
  useClientStore.setState({[id]: newState});
}

export function setClientActiveChild(id: ClientID, child: ClientID): void {
  const client = useClientStore.getState()[id];
  if (client.activeChildID === child) return;
  useClientStore.setState({[id]: {...client, activeChildID: child}});
}

export function setClientLoading(id: ClientID, status: ClientLoadingStatus, error?: string): void {
  const client = useClientStore.getState()[id];
  useClientStore.setState({[id]: {...client, loading: {status, error}}});
}
