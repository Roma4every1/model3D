import { useParameterStore, rowToParameterValue, unlockParameters } from 'entities/parameter';
import { programAPI } from './program.api';
import { fillProgramChannels } from './common';
import { useProgramStore } from '../store/program.store';


export function updateProgramParameter(program: Program, id: ParameterID, v: any): Promise<void> {
  const updater = new ProgramParameterUpdater(program);
  return updater.update(id, v);
}

class ProgramParameterUpdater {
  /** Отчёт, в котором изменили параметр. */
  private readonly program: Program;
  /** Изменённый параметр. */
  private parameter: Parameter;
  /** Названия каналов, которые зависят от изменённого параметра. */
  private relatedChannelNames: ChannelName[];
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

    if (this.relatedChannelNames.length > 0) {
      const externalStorage = useParameterStore.getState().storage;
      await fillProgramChannels(this.program, this.relatedChannelNames, externalStorage);
    }
    if (this.dependentParameters.length > 0) {
      this.setDependentParameterValues();
    }

    this.program.runnable = await programAPI.canRunProgram(this.program.id, parameters);
    unlockParameters(parameters);
    this.commitParameters();
  }

  private traverseParameters(): void {
    this.relatedChannelNames = [];
    this.dependentParameters = [];

    for (const parameter of this.program.parameters) {
      if (this.parameter.dependents.includes(parameter.id)) {
        this.dependentParameters.push(parameter);
        if (parameter.editor) parameter.editor.disabled = true;
      }
      if (parameter.channelName) {
        const channel = this.program.channels[parameter.channelName];
        if (!channel.config.parameters.includes(this.parameter.id)) continue;
        this.relatedChannelNames.push(channel.name);
        if (parameter.editor) parameter.editor.loading = true;
      }
    }
  }

  private setDependentParameterValues(): void {
    for (const p of this.dependentParameters) {
      this.program.relations.delete(p.id);
      if (p.nullable === false && p.channelName && p.type === 'tableRow') {
        const channel = this.program.channels[p.channelName];
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
