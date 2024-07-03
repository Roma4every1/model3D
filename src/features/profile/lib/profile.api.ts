import { v4 } from 'uuid';
import { xml2js } from 'xml-js';


export class ProfileAPI {
  /** Адрес сервера GeoManager. */
  public base: string;

  /** Создает задачус заданным имененм и параметрами. */
  public async createJob(name: string, payload: Partial<GMJobPayload>): Promise<GMJobID | null> {
    try {
      const query = {
        name: name, uid: v4(), reqExt: 'xml', resExt: 'xml',
        organizationCode: 'dbmm_tat$1', builderId: '{E2BB9801-C8B0-4869-AA9F-E1D136CB479E}',
        ...payload,
      };
      const path = this.base + '/job/create?' + new URLSearchParams(query).toString();
      await fetch(path, {method: 'POST', credentials: 'include'});
      return query.uid;
    } catch {
      return null;
    }
  }

  /** Получает данные по задаче с заданными именем и UID. */
  public async getJobResult<T>(name: string, id: GMJobID): Promise<T | null> {
    try {
      const path = this.base + '/job/result?' + this.getBasicQuery(name, id);
      return await fetch(path, {credentials: 'include'}).then(r => r.json());
    } catch (e) {
      return null;
    }
  }

  /** Получает статус выполнения по задаче с заданными именем и UID. */
  public async getJobProgress(name: string, id: GMJobID): Promise<any> {
    try {
      const path = this.base + '/job/progress?' + this.getBasicQuery(name, id);
      const data = await fetch(path, {credentials: 'include'}).then(r => r.text());
      return xml2js(data, {compact: false}).elements[0].attributes;
    } catch (e) {
      return {};
    }
  }

  /** Удаляет задачу с заданными именем и UID. */
  public async deleteJob(name: string, id: GMJobID): Promise<boolean> {
    try {
      const path = this.base + '/job/delete?' + this.getBasicQuery(name, id);
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
