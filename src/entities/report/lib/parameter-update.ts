import { useParameterStore, rowToParameterValue, unlockParameters } from 'entities/parameter';
import { reportAPI } from './report.api';
import { fillReportChannels } from './common';
import { useReportStore } from '../store/report.store';


export function updateReportParameter(report: ReportModel, id: ParameterID, v: any): Promise<void> {
  const updater = new ReportUpdater(report);
  return updater.update(id, v);
}

class ReportUpdater {
  /** Отчёт, в котором изменили параметр. */
  private readonly report: ReportModel;
  /** Изменённый параметр. */
  private parameter: Parameter;
  /** Названия каналов, которые зависят от изменённого параметра. */
  private relatedChannelNames: ChannelName[];
  /** Параметры, значения которых зависят от изменяемого параметра. */
  private dependentParameters: Parameter[];

  constructor(report: ReportModel) {
    this.report = report;
  }

  public async update(id: ParameterID, newValue: any): Promise<void> {
    const parameters = this.report.parameters;
    this.parameter = parameters.find(p => p.id === id);
    this.parameter.setValue(newValue);

    this.report.relations.delete(id);
    this.report.runnable = undefined;
    this.traverseParameters();
    this.commitParameters();

    if (this.relatedChannelNames.length > 0) {
      const externalStorage = useParameterStore.getState().storage;
      await fillReportChannels(this.report, this.relatedChannelNames, externalStorage);
    }
    if (this.dependentParameters.length > 0) {
      this.setDependentParameterValues();
    }

    this.report.runnable = await reportAPI.canRunReport(this.report.id, parameters);
    unlockParameters(parameters);
    this.commitParameters();
  }

  private traverseParameters(): void {
    this.relatedChannelNames = [];
    this.dependentParameters = [];

    for (const parameter of this.report.parameters) {
      if (this.parameter.dependents.includes(parameter.id)) {
        this.dependentParameters.push(parameter);
        if (parameter.editor) parameter.editor.disabled = true;
      }
      if (parameter.channelName) {
        const channel = this.report.channels[parameter.channelName];
        if (!channel.config.parameters.includes(this.parameter.id)) continue;
        this.relatedChannelNames.push(channel.name);
        if (parameter.editor) parameter.editor.loading = true;
      }
    }
  }

  private setDependentParameterValues(): void {
    for (const p of this.dependentParameters) {
      this.report.relations.delete(p.id);
      if (p.nullable === false && p.channelName && p.type === 'tableRow') {
        const channel = this.report.channels[p.channelName];
        const row = channel?.data?.rows?.at(0);
        if (row) { p.setValue(rowToParameterValue(row, channel)); continue; }
      }
      if (p.getValue() !== null) p.setValue(null);
    }
  }

  private commitParameters(): void {
    const { owner, parameters } = this.report;
    const models = useReportStore.getState().models;
    models[owner] = [...models[owner]];
    this.report.parameters = [...parameters];
    useReportStore.setState({models});
  }
}
