import { useClientStore } from './client.store';


export function addSessionClient(client: SessionClient): void {
  useClientStore.setState({[client.id]: client});
}

export function addSessionClients(clients: ClientStates): void {
  useClientStore.setState(clients);
}

export function setClientChildren(id: ClientID, children: ClientChildren): void {
  const client = useClientStore.getState()[id];
  useClientStore.setState({[id]: {...client, children}});
}

export function setClientActiveChild(id: ClientID, child: ClientID): void {
  const client = {...useClientStore.getState()[id]};
  client.children = {...client.children, active: child};
  useClientStore.setState({[id]: client});
}
