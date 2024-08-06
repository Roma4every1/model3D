import type { ParameterStore } from './parameter.store';
import type { ParameterUpdateEntry, ParameterUpdateData } from '../lib/parameter.types';
import { hasIntersection, setUnion, addToSet } from 'shared/lib';
import { clientAPI } from 'entities/client';
import { updateObjects } from 'entities/objects';
import { resetDependentPrograms } from 'entities/program';
import { useChannelStore, fillChannels, setChannels, resetDependentChannels } from 'entities/channel';
import { lockActivePresentation, unlockActivePresentation, updateActivePresentation } from 'widgets/presentation/lib/update';
import { updatePresentationTree } from 'widgets/left-panel/store/left-panel.actions';

import { parseParameterValue } from '../lib/factory';
import { rowToParameterValue } from '../impl/table-row';
import { findParameters, lockParameters, unlockParameters, calcParameterVisibility } from '../lib/common';
import { useParameterStore } from './parameter.store';


/** Обновление параметра и всех его зависимостей. */
export function updateParamDeep(id: ParameterID, newValue: any): Promise<void> {
  const state = useParameterStore.getState();
  const parameter = state.storage.get(id);
  if (parameter.getValue() === newValue) return Promise.resolve();
  parameter.setValue(newValue);

  const { promise, resolve } = Promise.withResolvers<void>();
  state.updateQueue.push({data: {id, newValue}, resolve});

  if (state.updateQueue.length === 1) {
    runUpdateLoop(state).then();
  } else {
    commitParameterChanges(new Set([id]));
  }
  return promise;
}

/** Обновление параметров и всех их зависимостей. */
export function updateParamsDeep(data: ParameterUpdateData[]): Promise<true | void> {
  const state = useParameterStore.getState();
  const filterData: ParameterUpdateData[] = [];

  for (const datum of data) {
    const parameter = state.storage.get(datum.id);
    if (datum.newValue === parameter.getValue()) continue;
    parameter.setValue(datum.newValue); filterData.push(datum);
  }
  if (filterData.length === 0) return Promise.resolve(true);

  const { promise, resolve } = Promise.withResolvers<void>();
  state.updateQueue.push({data: filterData, resolve});

  if (state.updateQueue.length === 1) {
    runUpdateLoop(state).then();
  } else {
    commitParameterChanges(new Set(filterData.map(d => d.id)));
  }
  return promise;
}

async function runUpdateLoop(state: ParameterStore): Promise<void> {
  lockActivePresentation();
  const queue = state.updateQueue;
  const updater = new Updater(state);

  while (queue.length) {
    const entry = queue[0];
    await updater.update(entry);
    if (queue.length === 1) await updater.commit();
    entry.resolve(); queue.shift();
  }
  unlockActivePresentation();
}

function commitParameterChanges(changes: Set<ParameterID>): void {
  const { storage, clients } = useParameterStore.getState();
  const newState: ParameterDict = {};

  for (const id in clients) {
    const clientParameters = clients[id];
    let changed = false;

    for (const parameter of clientParameters) {
      const template = parameter.editor?.visibilityTemplate;
      if (template && hasIntersection(template.parameterIDs, changes)) {
        calcParameterVisibility(parameter, storage);
        changed = true;
      } else if (!changed && changes.has(parameter.id)) {
        changed = true;
      }
    }
    newState[id] = changed ? [...clientParameters] : clientParameters;
  }
  useParameterStore.setState({clients: newState});
}

class Updater {
  private readonly state: ParameterStore;
  private readonly storage: ParameterMap;
  private readonly allChanges: Set<ParameterID>;

  private baseChanges: Set<ParameterID>;
  private dependentChanges: Set<ParameterID>;
  private dependentParameters: Parameter[];

  constructor(state: ParameterStore) {
    this.state = state;
    this.storage = this.state.storage;
    this.allChanges = new Set();
  }

  public async update(entry: ParameterUpdateEntry): Promise<void> {
    this.handleEntry(entry);
    this.dependentParameters = this.getDependentParameters();
    lockParameters(this.dependentParameters);
    commitParameterChanges(this.baseChanges);

    const dependentChannels = this.getDependentChannels();
    await fillChannels(dependentChannels, this.storage);
    this.dependentChanges = this.handleDependentParameters();
    await this.executeSetters();

    unlockParameters(this.dependentParameters);
    commitParameterChanges(this.dependentChanges);

    const resultChanges = setUnion(this.baseChanges, this.dependentChanges);
    addToSet(this.allChanges, resultChanges);

    resetDependentChannels(resultChanges);
    resetDependentPrograms(resultChanges);
    updatePresentationTree(resultChanges);

    for (const channel of Object.values(dependentChannels)) {
      if (hasIntersection(this.dependentChanges, channel.config.parameters)) {
        delete dependentChannels[channel.id];
      } else {
        channel.actual = true;
      }
    }
    setChannels(dependentChannels);
  }

  public async commit(): Promise<void> {
    await updateActivePresentation(false);
    updateObjects(this.allChanges);
  }

  /* --- --- */

  private handleEntry({data}: ParameterUpdateEntry): void {
    this.baseChanges = new Set();
    if (Array.isArray(data)) {
      for (const dataItem of data) this.handleEntryData(dataItem);
    } else {
      this.handleEntryData(data);
    }
  }

  private handleEntryData(data: ParameterUpdateData): void {
    const { id, newValue } = data;
    this.baseChanges.add(id);

    const listener = this.state.listeners.get(id);
    if (!listener) return;

    const result = listener(newValue, this.storage);
    if (result instanceof Set) {
      addToSet(this.baseChanges, result);
    } else if (result) {
      this.baseChanges.add(result);
    }
  }

  private getDependentParameters(): Parameter[] {
    const result: Parameter[] = [];
    for (const id of this.baseChanges) {
      const dependents = this.storage.get(id).dependents;
      for (const dep of dependents) {
        if (!result.some(p => p.id === dep)) result.push(this.storage.get(dep));
      }
    }
    return result;
  }

  private getDependentChannels(): ChannelDict {
    const result: ChannelDict = {};
    const channels = useChannelStore.getState().storage;

    for (const dep of this.dependentParameters) {
      const id = dep.channelID;
      if (!id || Object.hasOwn(result, id)) continue;
      const channel = channels[id];
      if (hasIntersection(this.baseChanges, channel.config.parameters)) result[id] = channel;
    }
    return result;
  }

  private handleDependentParameters(): Set<ParameterID> {
    const channels = useChannelStore.getState().storage;
    const dependentChanges: Set<ParameterID> = new Set();

    for (const p of this.dependentParameters) {
      if (p.nullable === false && p.channelID && p.type === 'tableRow') {
        const channel = channels[p.channelID];
        const row = channel?.data?.rows?.at(0);
        if (row) {
          p.setValue(rowToParameterValue(row, channel));
          dependentChanges.add(p.id); continue;
        }
      }
      if (p.getValue() !== null) {
        p.setValue(null);
        dependentChanges.add(p.id);
      }
    }
    return dependentChanges;
  }

  /* --- --- */

  private executeSetters(): Promise<void[]> {
    const filter = (setter: ParameterSetter): boolean => {
      const ep = setter.executeParameters;
      return hasIntersection(this.baseChanges, ep) || hasIntersection(this.dependentChanges, ep);
    };
    const map = (setter: ParameterSetter): Promise<void> => this.executeSetter(setter);
    return Promise.all(this.state.setters.filter(filter).map(map));
  }

  private async executeSetter(setter: ParameterSetter): Promise<void> {
    const payload = findParameters(setter.executeParameters, this.storage);
    const rawValue = await clientAPI.executeLinkedProperty(setter.client, payload, setter.index);
    const parameter = this.storage.get(setter.setParameter);

    if (rawValue === null) {
      if (parameter.getValue() === null) return;
      parameter.setValue(null);
    } else {
      parameter.setValue(parseParameterValue(rawValue, parameter.type));
    }
    this.dependentChanges.add(parameter.id);
  }
}
