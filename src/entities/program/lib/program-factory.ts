import { type ProgramInfo, programAPI } from './program.api';
import { findParameters } from 'entities/parameter';
import { programCompareFn } from './common';


export class ProgramFactory {
  private readonly owner: ClientID;
  private readonly pStorage?: ParameterMap;
  private readonly pNameResolve?: PNameResolve;

  constructor(owner: ClientID, pStorage?: ParameterMap, pNameResolve?: PNameResolve) {
    this.owner = owner;
    this.pStorage = pStorage;
    this.pNameResolve = pNameResolve;
  }

  /** Создаёт список программ презентации или формы. */
  public async create(): Promise<Program[]> {
    const { ok, data } = await programAPI.getProgramList(this.owner);
    if (!ok) return [];

    const create = (info: ProgramInfo, i: number) => this.createProgram(info, i);
    const models = await Promise.all(data.map(create));
    return models.sort(programCompareFn);
  }

  private async createProgram(info: ProgramInfo, orderIndex: number): Promise<Program> {
    const program: Program = {
      id: info.id, type: info.type, owner: this.owner, orderIndex, displayName: info.displayName,
      availabilityParameters: [], available: true, runnable: false,
    };
    const parameterNames = info.availabilityParameters ?? info.paramsForCheckVisibility;
    if (parameterNames && this.pNameResolve) {
      for (const name of parameterNames) {
        const id = this.pNameResolve(name);
        if (id) program.availabilityParameters.push(id);
      }
      const parameters = findParameters(program.availabilityParameters, this.pStorage);
      program.available = await programAPI.getProgramAvailability(info.id, parameters);
    }
    return program;
  }
}
