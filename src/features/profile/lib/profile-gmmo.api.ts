import { xml2js } from 'xml-js';
import { v4 as uuidv4 } from 'uuid';
import { GMMOJobDefaultParams } from './constants';


export class ProfileGMMOApi {
  /** Адрес сервера GMMO. */
  private readonly base = 'http://wmw-tn:8081/ij-srv';

  /** Создает задачус заданным имененм и параметрами. */
  public async createGMMOJob(name: string, params: Partial<GMMOJobParams>): Promise<string> {
    try {
      const jobUID = uuidv4();
      const query = {name, uid: jobUID, ...GMMOJobDefaultParams, ...params};
      const path = this.base + '/job/create?' + new URLSearchParams(query).toString();
      await fetch(path, {method: 'POST', credentials: 'include'});
      return jobUID;
    } catch {
      return undefined;
    }
  }

  /** Получает данные по задаче с заданными именем и UID. */
  public async getResultGMMOJob(name: string, uid: string): Promise<GMMOJobData> {
    try {
      const path = this.base + '/job/result?' + this.getBasicQuery(name, uid);
      return await fetch(path, {credentials: 'include'}).then(r => r.json());
    } catch (e) {
      return null;
    }
  }

  /** Получает статус выполнения по задаче с заданными именем и UID. */
  public async getProgressGMMOJob(name: string, uid: string): Promise<any> {
    try {
      const path = this.base + '/job/progress?' + this.getBasicQuery(name, uid);
      const data = await fetch(path, {credentials: 'include'}).then(r => r.text());
      return xml2js(data, {compact: false}).elements[0].attributes;
    } catch (e) {
      return {};
    }
  }

  /** Удаляет задачу с заданными именем и UID. */
  public async deleteGMMOJob(name: string, uid: string): Promise<boolean> {
    try {
      const path = this.base + '/job/delete?' + this.getBasicQuery(name, uid);
      await fetch(path, {method: 'POST', credentials: 'include'});
      return true;
    } catch {
      return false;
    }
  }

  private getBasicQuery(name: string, uid: string): string {
    const query = {name, uid, resExt: 'xml', reqExt: 'xml', deleteResult: 'True'};
    return new URLSearchParams(query).toString();
  }
}

export const profileAPI = new ProfileGMMOApi();
