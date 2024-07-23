import { useParameterStore, rowToParameterValue, unlockParameters } from 'entities/parameter';
import { programAPI } from './program.api';
import { fillProgramChannels } from './common';
import { useProgramStore } from '../store/program.store';


export function updateProgramParameter(p: Program, id: ParameterID, value: any): Promise<void> {
  const updater = new ProgramParameterUpdater(p);
  return updater.update(id, value);
}

class ProgramParameterUpdater {
  /** Отчёт, в котором изменили параметр. */
  private readonly program: Program;
  /** Изменённый параметр. */
  private parameter: Parameter;
  /** ID каналов, которые зависят от изменённого параметра. */
  private relatedChannelIDs: ChannelID[];
  /** Параметры, значения которых зависят от изменяемого параметра. */
  private dependentParameters: Parameter[];

  constructor(program: Program) {
    this.program = program;
  }

  public async update(id: ParameterID, newValue: any): Promise<void> {
    const parameters = this.program.parameters;
    this.parameter = parameters.find(p => p.id === id);
    this.parameter.setValue(newValue);

    this.program.relations.delete(id);
    this.program.runnable = undefined;
    this.traverseParameters();
    this.commitParameters();

    if (this.relatedChannelIDs.length) {
      const externalStorage = useParameterStore.getState().storage;
      await fillProgramChannels(this.program, this.relatedChannelIDs, externalStorage);
    }
    if (this.dependentParameters.length > 0) {
      this.setDependentParameterValues();
    }

    this.program.runnable = await programAPI.canRunProgram(this.program.id, parameters);
    unlockParameters(parameters);
    this.commitParameters();
  }

  private traverseParameters(): void {
    this.relatedChannelIDs = [];
    this.dependentParameters = [];

    for (const parameter of this.program.parameters) {
      if (this.parameter.dependents.includes(parameter.id)) {
        this.dependentParameters.push(parameter);
        if (parameter.editor) parameter.editor.disabled = true;
      }
      if (parameter.channelID) {
        const channel = this.program.channels[parameter.channelID];
        if (!channel.config.parameters.includes(this.parameter.id)) continue;
        this.relatedChannelIDs.push(channel.id);
        if (parameter.editor) parameter.editor.loading = true;
      }
    }
  }

  private setDependentParameterValues(): void {
    for (const p of this.dependentParameters) {
      this.program.relations.delete(p.id);
      if (p.nullable === false && p.channelID && p.type === 'tableRow') {
        const channel = this.program.channels[p.channelID];
        const row = channel?.data?.rows?.at(0);
        if (row) { p.setValue(rowToParameterValue(row, channel)); continue; }
      }
      if (p.getValue() !== null) p.setValue(null);
    }
  }

  private commitParameters(): void {
    const { owner, parameters } = this.program;
    const models = useProgramStore.getState().models;
    models[owner] = [...models[owner]];
    this.program.parameters = [...parameters];
    useProgramStore.setState({models});
  }
}
