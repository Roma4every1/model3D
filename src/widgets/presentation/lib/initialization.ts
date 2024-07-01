import { t } from 'shared/locales';
import { fillPatterns } from 'shared/drawing';
import { useObjectsStore } from 'entities/objects';
import { useChannelStore } from 'entities/channel';
import { setReportModels } from 'entities/report';
import { showWarningMessage } from 'entities/window';
import { addSessionClient, addSessionClients, setClientLoading } from 'entities/client';
import { createFormDict } from './form-dict';
import { PresentationFactory } from './presentation-factory';

import {
  useParameterStore, lockParameters, unlockParameters,
  findClientParameter, findParameterDependents,
} from 'entities/parameter';


/** Инициализация презентации. */
export async function initializePresentation(id: ClientID): Promise<void> {
  const factory = new PresentationFactory(id);
  const presentation = await factory.createState();
  if (!presentation) return setClientLoading(id, 'error', 'app.presentation-fetch-error');

  const parameters = factory.getParameters();
  lockParameters(parameters);
  addSessionClient(presentation);
  factory.createReports().then(reports => setReportModels(id, reports));

  setClientLoading(id, 'data');
  const children = factory.createChildren();
  const allChannels = factory.getAllChannels();

  const objects = useObjectsStore.getState();
  const clientParameters = useParameterStore.getState().clients;
  setParameterDependents(clientParameters);

  for (const child of presentation.children) {
    const client: SessionClient = children[child.id];
    const loading: ClientLoadingState = client.loading;
    if (loading.status === 'error') { loading.error = 'app.form-fetch-error'; continue; }

    const creator = createFormDict[client.type];
    if (creator) creator({
      state: client, settings: client.settings, objects: objects,
      parameters: clientParameters, channels: allChannels,
    });
    loading.status = 'done';
  }

  const fillSuccess = await factory.fillData();
  if (!fillSuccess) showWarningMessage(t('app.presentation-data-init-error'));
  unlockParameters(parameters);
  clientParameters[id] = [...parameters];
  useChannelStore.setState(factory.getCreatedChannels());

  const types = presentation.childrenTypes;
  if (types.has('map') || types.has('carat') || types.has('profile')) {
    await fillPatterns.initialize();
  }
  addSessionClients(children);
  setClientLoading(id, 'done');
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
