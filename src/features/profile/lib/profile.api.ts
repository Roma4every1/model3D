import { v4 } from 'uuid';


export interface StrataJobOptions {
  /** Код организации. */
  organizationCode: string;
  /** Код месторождения (объекта разработки). */
  objectCode: string;
  /** Код активного пласта. */
  plastCode: string;
  /** Код карты. */
  mapCode: string;
}
/** Параметры построения профиля. */
export interface ProfileJobOptions extends StrataJobOptions {
  /** Узлы трассы через запяту. */
  trace: string;
  /** Пласты через запятую. */
  plastList: string;
  builderParameters: BuilderParameters;
  nativeFormat: '0' | '1';
}
export type BuilderParameters = Record<string, string | number>;

export class ProfileAPI {
  /** Адрес сервиса GeoManager. */
  private base: string;

  public setBaseURL(base: string): void {
    if (base && !base.endsWith('/')) base += '/';
    this.base = base;
  }

  public check(): boolean {
    return Boolean(this.base);
  }

  public createStrataJob(options: StrataJobOptions): Promise<GMJobID | null> {
    return this.createJob('pl', options as any);
  }

  public createProfileJob(options: ProfileJobOptions): Promise<GMJobID | null> {
    options.builderParameters = this.serializeBuilderParameters(options.builderParameters) as any;
    return this.createJob('profile', options as any);
  }

  private createJob(name: string, options: Record<string, string>): Promise<GMJobID | null> {
    const id: GMJobID = v4();
    options.uid = id;
    options.name = name;
    options.reqExt = 'xml';
    options.resExt = 'xml';
    options.builderId = '{E2BB9801-C8B0-4869-AA9F-E1D136CB479E}';

    const path = this.base + 'job/create?' + new URLSearchParams(options).toString();
    const init: RequestInit = {method: 'POST', credentials: 'include'};

    const cbThen = (res: Response): GMJobID => res.ok ? id : null;
    return fetch(path, init).catch(() => null).then(cbThen);
  }

  private serializeBuilderParameters(parameters: BuilderParameters): string {
    const parts: string[] = ['<BuilderParameters>'];
    for (const name in parameters) {
      const value = String(parameters[name]);
      parts.push('<Param name="', name, '" value="', value, '"/>');
    }
    parts.push('</BuilderParameters>');
    return window.btoa(parts.join('')).replaceAll('+', '_');
  }

  /* --- --- */

  /** Получает данные по задаче с заданными именем и UID. */
  public async getJobResult<T>(name: string, id: GMJobID): Promise<T | false> {
    try {
      const path = this.base + 'job/result?' + this.getBasicQuery(name, id);
      return await fetch(path, {credentials: 'include'}).then(r => r.json());
    } catch (e) {
      return false;
    }
  }

  /** Получает статус выполнения по задаче с заданными именем и UID. */
  public async getJobProgress(name: string, id: GMJobID): Promise<{percent: number, message: string} | null> {
    try {
      const path = this.base + 'job/progress?' + this.getBasicQuery(name, id);
      const data = await fetch(path, {credentials: 'include'}).then(r => r.text());

      // приходит XML вида <progress percent="..." message="..."/>
      const match = data.match(/percent="([^"]+)" message="([^"]+)"/);
      if (!match) return null;

      const percent = Math.floor(Number(match[1]) * 2);
      const message = match[2].replaceAll('|', '\n');
      return {percent, message};
    } catch {
      return null;
    }
  }

  /** Удаляет задачу с заданными именем и UID. */
  public async deleteJob(name: string, id: GMJobID): Promise<boolean> {
    try {
      const path = this.base + 'job/delete?' + this.getBasicQuery(name, id);
      await fetch(path, {method: 'POST', credentials: 'include'});
      return true;
    } catch {
      return false;
    }
  }

  private getBasicQuery(name: string, id: GMJobID): string {
    const query = {name, uid: id, resExt: 'xml', reqExt: 'xml', deleteResult: 'True'};
    return new URLSearchParams(query).toString();
  }
}

export const profileAPI = new ProfileAPI();
