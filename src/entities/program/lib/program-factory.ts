import { type ProgramDTO, programAPI } from './program.api';
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

    const create = (dto: ProgramDTO, i: number) => this.createProgram(dto, i);
    const models = await Promise.all(data.map(create));
    return models.sort(programCompareFn);
  }

  private async createProgram(dto: ProgramDTO, orderIndex: number): Promise<Program> {
    const program: Program = {
      id: dto.id, type: dto.type, owner: this.owner, orderIndex, displayName: dto.displayName,
      availabilityParameters: [], available: true, runnable: false,
    };
    if (dto.paramsForCheckVisibility && this.pNameResolve) {
      for (const name of dto.paramsForCheckVisibility) {
        const id = this.pNameResolve(name);
        if (id) program.availabilityParameters.push(id);
      }
      const parameters = findParameters(program.availabilityParameters, this.pStorage);
      program.available = await programAPI.getProgramAvailability(dto.id, parameters);
    }
    return program;
  }
}
