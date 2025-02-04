import { InitializationError } from 'shared/lib';
import { t } from 'shared/locales';
import { fillPatterns } from 'shared/drawing';
import { useObjectsStore } from 'entities/objects';
import { useChannelStore, addChannels, setChannels } from 'entities/channel';
import { setClientPrograms } from 'entities/program';
import { showWarningMessage } from 'entities/window';
import { addSessionClient, addSessionClients, setClientLoading } from 'entities/client';
import { getChannelsToUpdate } from './update';
import { formCreators } from './form-dict';
import { PresentationFactory } from './presentation-factory';

import {
  useParameterStore, lockParameters, unlockParameters,
  findClientParameter, findParameterDependents,
} from 'entities/parameter';


/** Инициализация презентации. */
export async function initializePresentation(id: ClientID, rootInit?: Promise<void>): Promise<void> {
  const factory = new PresentationFactory(id);
  const presentation = await factory.createState();
  if (!presentation) return setClientLoading(id, 'error', 'app.presentation-fetch-error');

  const parameters = factory.getParameters();
  const createdChannels = factory.getCreatedChannels();
  lockParameters(parameters);
  addChannels(createdChannels);
  addSessionClient(presentation);
  const programPromise = factory.createPrograms().then(p => setClientPrograms(id, p));

  setClientLoading(id, 'data');
  const children = factory.createChildren();
  const objects = useObjectsStore.getState();
  const channels = useChannelStore.getState().storage;
  const clientParameters = useParameterStore.getState().clients;
  setParameterDependents(clientParameters);

  for (const child of presentation.children) {
    const client: SessionClient = children[child.id];
    const { type, loading } = client;

    if (type in formCreators && loading.status === 'init') {
      try {
        formCreators[type]({
          state: client, objects: objects,
          parameters: clientParameters, channels,
        });
      } catch (e: unknown) {
        loading.status = 'error';
        if (e instanceof InitializationError && e.message) loading.error = e.message;
      }
    }

    if (loading.status !== 'error') {
      loading.status = 'done';
    } else if (!loading.error) {
      loading.error = 'app.form-fetch-error';
    }
  }

  if (rootInit) await rootInit;
  const clientsToUpdate: SessionClient[] = [presentation];
  presentation.openedChildren.forEach(id => clientsToUpdate.push(children[id]));

  const fillSuccess = await factory.fillData(getChannelsToUpdate(clientsToUpdate));
  if (!fillSuccess) showWarningMessage(t('app.presentation-data-init-error'));
  await programPromise;

  unlockParameters(parameters);
  clientParameters[id] = [...parameters];
  setChannels(createdChannels);

  const types = presentation.childrenTypes;
  if (types.has('map') || types.has('carat') || types.has('profile')) {
    await fillPatterns.initialize();
  }
  addSessionClients(children);
  setClientLoading(id, 'done');
  await factory.executeExternalSetters();
}

function setParameterDependents(dict: ParameterDict): void {
  const rootID = 'root';
  const dictValues = Object.values(dict);
  const depMap: Map<ParameterID, Set<ParameterID>> = new Map();

  for (const list of dictValues) {
    for (const parameter of list) {
      depMap.set(parameter.id, new Set());
    }
  }
  for (const clientID in dict) {
    const clients = clientID === rootID ? [rootID] : [clientID, rootID];
    for (const { id, dependsOn } of dict[clientID]) {
      for (const name of dependsOn) {
        const dep = findClientParameter(name, dict, clients);
        if (dep) depMap.get(dep.id).add(id);
      }
    }
  }
  for (const list of dictValues) {
    for (const parameter of list) {
      findParameterDependents(parameter, depMap);
    }
  }
}
