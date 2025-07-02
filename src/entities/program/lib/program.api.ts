import type { ReqOptions, Res } from 'shared/lib';
import type { ParameterInit } from 'entities/parameter';
import { type Fetcher, fetcher, getFileExtension } from 'shared/lib';
import { serializeParameter } from 'entities/parameter';


/** Первичная информация о серверной программе. */
export interface ProgramInfo {
  /** Идентификатор программы. */
  readonly id: ProgramID;
  /** Тип программы: обычная программа или отчёт. */
  readonly type: ProgramType;
  /** Название программы, которое видит пользователь */
  readonly displayName: string;
  /** Имена параметров для проверки доступности. */
  readonly availabilityParameters?: string[];
  /** Имена параметров для проверки доступности (старое API). */
  readonly paramsForCheckVisibility?: string[];
}

/** Данные о параметрах и составных частях отчёта. */
export interface ProgramData {
  /** Кастомные параметры процедуры. */
  readonly parameters: ParameterInit[];
  /** Все необходимые параметры для процедуры (для `QueryString` и `ReportString` false). */
  readonly replaces: Record<string, boolean>;
  /** Количество исполняемых блоков процедуры. */
  readonly linkedPropertyCount: number;
}

export class ProgramAPI {
  constructor(private readonly api: Fetcher) {}

  /** Список всех программ клиента сессии. */
  public getProgramList(clientID: ClientID): Promise<Res<ProgramInfo[]>> {
    if (this.api.legacy) {
      return this.api.get('/programsList', {query: {formId: clientID}});
    } else {
      return this.api.get('/program/list', {query: {id: clientID}});
    }
  }

  /** Полная информация о программе. */
  public getProgramData(id: ProgramID): Promise<Res<ProgramData>> {
    if (this.api.legacy) {
      return this.api.get('/reportData',{query: {reportId: id}});
    } else {
      return this.api.get('/program/data', {query: {id: id}});
    }
  }

  /** Доступна ли программа для выполнения при текущих параметрах сессии. */
  public async getProgramAvailability(id: ProgramID, parameters: Parameter[]): Promise<boolean> {
    const payload: SerializedParameter[] = parameters.map(serializeParameter);
    if (this.api.legacy) {
      const options: ReqOptions = {json: {reportId: id, paramValues: payload}};
      const res = await this.api.post('/programVisibility', options);
      return res.ok && res.data === true;
    } else {
      const options: ReqOptions = {query: {id}, json: {parameters: payload}};
      const res = await this.api.post('/program/availability', options);
      return res.ok && res.data.available;
    }
  }

  /** Можно ли запустить программу при заданных параметрах. */
  public async canRunProgram(id: ProgramID, parameters: Parameter[]): Promise<boolean> {
    const payload: SerializedParameter[] = parameters.map(serializeParameter);
    if (this.api.legacy) {
      const options: ReqOptions = {json: {reportId: id, paramValues: payload}};
      const res = await this.api.post('/canRunReport', options);
      return res.ok && res.data === true;
    } else {
      const options: ReqOptions = {query: {id}, json: {parameters: payload}};
      const res = await this.api.post('/program/validate', options);
      return res.ok && res.data.valid;
    }
  }

  /** Выполнение блока программы. */
  public executeReportProperty(id: ProgramID, parameters: Parameter[], index: number): Promise<Res<OperationData>> {
    const payload: SerializedParameter[] = parameters.map(serializeParameter);
    if (this.api.legacy) {
      const json = {reportId: id, parameters: payload, index};
      return this.api.post('/executeReportProperty', {json});
    } else {
      const options: ReqOptions = {query: {id, index}, json: {parameters: payload}};
      return this.api.post('/program/execute', options);
    }
  }

  /** Получение статуса операции. */
  public async getOperationStatus(id: OperationID): Promise<Res<OperationStatus>> {
    let res: Res<OperationStatus>;
    if (this.api.legacy) {
      res = await this.api.get('/operationStatus', {query: {operationId: id}});
    } else {
      res = await this.api.get('/program/operation/status', {query: {id}});
    }
    if (res.ok && res.data) {
      const status = res.data;
      status.id = id;
      status.timestamp = new Date(status.timestamp);
      if (status.file) status.file.extension = getFileExtension(status.file.name);
    }
    return res;
  }

  public exportChartExcel(programID: ProgramID, xml: string): Promise<Res<OperationData>> {
    const json = {reportID: programID, xml: xml};
    return this.api.post('/executeProgram', {json});
  }

  public clearPrograms(clientID: ClientID): Promise<Res<boolean>> {
    return this.api.get('/clearReports', {query: {presentationId: clientID}});
  }

  public uploadFile(filename: string, data: ArrayBuffer, signal?: AbortSignal): Promise<Res<string>> {
    return this.api.post('/uploadFile', {query: {filename}, blob: data, signal});
  }

  public downloadFile(path: string): Promise<Res<Blob>> {
    const apiPath = this.api.legacy ? '/downloadResource' : '/app/resource';
    return this.api.get(apiPath, {query: {path}, then: 'blob'});
  }
}

export const programAPI = new ProgramAPI(fetcher);
