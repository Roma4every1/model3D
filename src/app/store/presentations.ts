import type { ParameterUpdateData } from 'entities/parameter';
import { useParameterStore, updateParamsDeep, parseParameterValue } from 'entities/parameter';
import { clientAPI, useClientStore, setClientActiveChild } from 'entities/client';
import { initializePresentation } from 'widgets/presentation/lib/initialization';
import { updateActivePresentation } from 'widgets/presentation/lib/update';
import { useAppStore } from './app.store';


export function selectPresentation(id: ClientID): void {
  const clientState = useClientStore.getState()[id];
  if (clientState) {
    setClientActiveChild('root', id);
    if (clientState.loading.status !== 'done') return;

    const values = executeStaticSetters(id);
    if (values) {
      values.then(updateParamsDeep).then(update => update && updateActivePresentation());
    } else {
      updateActivePresentation().then();
    }
  } else {
    const queue = useAppStore.getState().initQueue;
    if (!queue.includes(id)) {
      queue.push(id);
      if (queue.length === 1) initializePresentations(queue).then();
    }
    setClientActiveChild('root', id);
  }
}

/**
 * Если установщик параметра не имеет параметров выполнения,
 * он должен выполняться при переходе на презентацию.
 */
function executeStaticSetters(id: ClientID): Promise<ParameterUpdateData[]> | null {
  const { setters: allSetters, storage } = useParameterStore.getState();
  const setters = allSetters.filter(s => s.executeParameters.size === 0 && s.client === id);
  if (setters.length === 0) return null;

  return Promise.all(setters.map(async (s: ParameterSetter): Promise<ParameterUpdateData> => {
    const rawValue = await clientAPI.executeLinkedProperty(id, [], s.index);
    const parameter = storage.get(s.setParameter);
    return {id: s.setParameter, newValue: parseParameterValue(rawValue, parameter.type)};
  }));
}

/**
 * Запускает процесс инициализации одной или нескольких презентаций.
 * @param queue очередь презентаций
 * @param rootInit промис инициализации главной формы (чтобы избежать гонки данных)
 */
export async function initializePresentations(queue: ClientID[], rootInit?: Promise<any>): Promise<void> {
  while (queue.length) {
    const id = queue[0];
    await initializePresentation(id, rootInit);
    queue.shift();
  }
}
