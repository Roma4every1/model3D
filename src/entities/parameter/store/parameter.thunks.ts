import type { ParameterStore } from './parameter.store';
import { hasIntersection, setUnion, addToSet } from 'shared/lib';
import { clientAPI } from 'entities/client';
import { updateObjects } from 'entities/objects';
import { resetDependentPrograms } from 'entities/program';
import { useChannelStore, fillChannels, resetDependentChannels } from 'entities/channel';
import { updateActivePresentation } from 'widgets/presentation/lib/update';
import { updatePresentationTree } from 'widgets/left-panel/store/left-panel.actions';

import { parseParameterValue } from '../lib/factory';
import { rowToParameterValue } from '../impl/table-row';
import { findParameters, lockParameters, unlockParameters } from '../lib/common';
import { useParameterStore } from './parameter.store';


/** Обновление параметра и всех его зависимостей. */
export function updateParamDeep(id: ParameterID, newValue: any): Promise<void> {
  const state = useParameterStore.getState();
  state.storage.get(id).setValue(newValue);

  const { promise, resolve } = Promise.withResolvers<void>();
  state.updateQueue.push({id, newValue, resolve});

  if (state.updateQueue.length === 1) {
    runUpdateLoop(state).then();
  } else {
    commitParameterChanges(new Set([id]));
  }
  return promise;
}

async function runUpdateLoop(state: ParameterStore): Promise<void> {
  const queue = state.updateQueue;
  const updater = new Updater(state);

  while (queue.length) {
    const { id, newValue, resolve } = queue[0];
    await updater.update(id, newValue);
    if (queue.length === 1) await updater.commit();
    resolve(); queue.shift();
  }
}

function commitParameterChanges(changes: Set<ParameterID>): void {
  const state = useParameterStore.getState().clients;
  const newState: ParameterDict = {};

  for (const cid in state) {
    const list = state[cid];
    const changed = list.some(p => changes.has(p.id));
    newState[cid] = changed ? [...list] : list;
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

  public async update(id: ParameterID, newValue: any): Promise<void> {
    this.baseChanges = this.handleBaseParameter(id, newValue);
    this.dependentParameters = this.getDependentParameters();
    lockParameters(this.dependentParameters);
    commitParameterChanges(this.baseChanges);

    await fillChannels(this.getDependentChannels(), this.storage);
    this.dependentChanges = this.handleDependentParameters();
    await this.executeSetters();

    unlockParameters(this.dependentParameters);
    commitParameterChanges(this.dependentChanges);

    const resultChanges = setUnion(this.baseChanges, this.dependentChanges);
    addToSet(this.allChanges, resultChanges);

    resetDependentChannels(resultChanges);
    resetDependentPrograms(resultChanges);
    updatePresentationTree(resultChanges);
  }

  public async commit(): Promise<void> {
    await updateActivePresentation();
    updateObjects(this.allChanges);
  }

  /* --- --- */

  private handleBaseParameter(id: ParameterID, newValue: any): Set<ParameterID> {
    const baseChanges: Set<ParameterID> = new Set([id]);
    const listener = this.state.listeners.get(id);

    if (listener) {
      const result = listener(newValue, this.storage);
      if (result instanceof Set) {
        addToSet(baseChanges, result);
      } else if (result) {
        baseChanges.add(result);
      }
    }
    return baseChanges;
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
    const channels = useChannelStore.getState();

    for (const dep of this.dependentParameters) {
      const name = dep.channelName;
      if (!name || Object.hasOwn(result, name)) continue;
      const channel = channels[name];
      if (hasIntersection(this.baseChanges, channel.config.parameters)) result[name] = channel;
    }
    return result;
  }

  private handleDependentParameters(): Set<ParameterID> {
    const channels = useChannelStore.getState();
    const dependentChanges: Set<ParameterID> = new Set();

    for (const p of this.dependentParameters) {
      if (p.nullable === false && p.channelName && p.type === 'tableRow') {
        const channel = channels[p.channelName];
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
    const map = (setter: ParameterSetter): Promise<void> => {
      this.dependentChanges.add(setter.setParameter);
      return this.executeSetter(setter);
    };
    return Promise.all(this.state.setters.filter(filter).map(map));
  }

  private async executeSetter(setter: ParameterSetter): Promise<void> {
    const payload = findParameters(setter.executeParameters, this.storage);
    const rawValue = await clientAPI.executeLinkedProperty(setter.client, payload, setter.index);
    const parameter = this.storage.get(setter.setParameter);
    const value = rawValue === null ? null : parseParameterValue(rawValue, parameter.type);
    parameter.setValue(value);
  }
}
