import { useClientStore, setClientActiveChild } from 'entities/client';
import { initializePresentation } from 'widgets/presentation/lib/initialization';
import { updateActivePresentation } from 'widgets/presentation/lib/update';
import { useAppStore } from './app.store';


export function selectPresentation(id: ClientID): void {
  const clientState = useClientStore.getState()[id];
  if (clientState) {
    setClientActiveChild('root', id);
    if (clientState.loading.status === 'done') updateActivePresentation().then();
  } else {
    const queue = useAppStore.getState().initQueue;
    if (!queue.includes(id)) {
      queue.push(id);
      if (queue.length === 1) initializePresentations(queue).then();
    }
    setClientActiveChild('root', id);
  }
}

export async function initializePresentations(queue: ClientID[]): Promise<void> {
  while (queue.length) {
    const id = queue[0];
    await initializePresentation(id);
    queue.shift();
  }
}
