import type { ProgramData } from './program.api';
import { showWarningMessage } from 'entities/window';
import { createChannels } from 'entities/channel';
import { programAPI } from './program.api';
import { fillProgramChannel } from './common';
import { useProgramStore } from '../store/program.store';

import {
  useParameterStore, createParameter, parameterCompareFn,
  findClientParameter, getParameterChannels, findParameterDependents,
} from 'entities/parameter';


export async function initializeActiveProgram(program: Program): Promise<void> {
  const { id, owner } = program;
  const { ok, data, message } = await programAPI.getProgramData(id);
  if (!ok) { showWarningMessage(message); return; }

  const linkedPropertyCount = data.linkedPropertyCount;
  const [parameters, relations] = createProgramParameters(owner, data);
  const channels = await createProgramChannels(owner, parameters);

  let runnable = true;
  if (parameters.length) runnable = await programAPI.canRunProgram(id, parameters);

  const allModels = useProgramStore.getState().models;
  const models = allModels[owner];
  const index = models.indexOf(program);

  models[index] = {...program, runnable, parameters, channels, linkedPropertyCount, relations};
  useProgramStore.setState({models: {...allModels, [owner]: [...models]}});
}

function createProgramParameters(id: ClientID, data: ProgramData): [Parameter[], Map<ParameterID, ParameterID>] {
  const result: Parameter[] = [];
  const relations: Map<ParameterID, ParameterID> = new Map();
  const { parameters: inits, replaces } = data;
  const { clients: clientParameters, idGenerator } = useParameterStore.getState();

  for (const name in replaces) {
    const init = inits.find(p => p.id === name);
    if (init) { result.push(createParameter(idGenerator.get(), init)); continue; }

    const parameter = findClientParameter(name, clientParameters, [id, 'root']);
    if (!parameter) continue;

    const clone = parameter.clone();
    clone.id = idGenerator.get();
    clone.setValue(structuredClone(parameter.getValue()));
    relations.set(clone.id, parameter.id);

    if (clone.editor) {
      if (replaces[name] === true) {
        delete clone.editor;
      } else {
        clone.editor = {...parameter.editor};
      }
    }
    result.push(clone);
  }

  setProgramParameterDependents(result);
  return [result.sort(parameterCompareFn), relations];
}

async function createProgramChannels(id: ClientID, parameters: Parameter[]): Promise<ChannelDict> {
  const { clients, storage } = useParameterStore.getState();
  const localParameters = clients[id];
  const globalParameters = clients.root;

  const resolve = (name: ParameterName): ParameterID | undefined => {
    const cb = (p: Parameter): boolean => p.name === name;
    return (parameters.find(cb) ?? localParameters.find(cb) ?? globalParameters.find(cb))?.id;
  };

  const names = [...getParameterChannels(parameters)];
  const channels = await createChannels(names, resolve);

  await Promise.all(names.map(name => fillProgramChannel(channels[name], parameters, storage)));
  return channels;
}

function setProgramParameterDependents(parameters: Parameter[]): void {
  const depMap: Map<ParameterID, Set<ParameterID>> = new Map();
  for (const parameter of parameters) depMap.set(parameter.id, new Set());

  for (const { id, dependsOn } of parameters) {
    for (const name of dependsOn) {
      const dep = parameters.find(p => p.name === name);
      if (dep) depMap.get(dep.id).add(id);
    }
  }
  for (const parameter of parameters) {
    findParameterDependents(parameter, depMap);
  }
}
