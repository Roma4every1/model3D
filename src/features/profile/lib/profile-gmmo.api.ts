import {BaseAPI} from "../../../shared/lib";
import { v4 as uuidv4 } from 'uuid';
import {GMMOJobDefaultParams} from "./constants.ts";
import { xml2js } from 'xml-js';

/** Адрес сервера GMMO. */
const GMMOServerURL = 'http://wmw-tn:8081/ij-srv/';
/** Корень сервера GMMO. */
const GMMORoot = '/'

export class ProfileGMMOApi extends BaseAPI {
  constructor(webServicesURL: string, root: string) {
    super();
    this.setBase(webServicesURL);
    this.setRoot(root);
  }

  /** Создает задачус заданным имененм и параметрами. */
  public async createGMMOJob(name: string, params: Partial<GMMOJobParams>) {
    const jobUID = uuidv4();
    const query: ReqQuery = {
      name,
      uid: jobUID,
      ...GMMOJobDefaultParams,
      ...params,
    };

    try {
      await this.request<any>({method: 'POST', path: 'job/create', query});
      return jobUID;
    } catch (e) {
      return
    }
  }

  /** Получает данные по задаче с заданными именем и UID. */
  public async getResultGMMOJob(name: string, uid: string) {
    const query: ReqQuery = this.getBasicQuery(name, uid);

    try {
      return await this.request<GMMOJobData>({method: 'GET', path: 'job/result', query});
    } catch (e) {
      return null;
    }
  }

  /** Получает статус выполнения по задаче с заданными именем и UID. */
  public async getProgressGMMOJob(name: string, uid: string) {
    const query: ReqQuery = this.getBasicQuery(name, uid);

    const mapper: ReqMapper = 'text';
    try {
      const progressResData = await this.request<string>({
        method: 'GET',
        path: 'job/progress',
        query, mapper
      });

      return xml2js(progressResData.data, {compact: false}).elements[0].attributes;
    } catch (e) {
      return {};
    }
  }

  /** Удаляет задачу с заданными именем и UID. */
  public async deleteGMMOJob(name: string, uid: string) {
    const query: ReqQuery = this.getBasicQuery(name, uid);

    try {
      await this.request<any>({method: 'POST', path: 'job/delete', query});
      return true;
    } catch (e) {
      return false;
    }
  }

  private getBasicQuery = (name: string, uid: string): ReqQuery => ({
    name,
    uid,
    resExt: 'xml',
    reqExt: 'xml',
    deleteResult: 'True'
  });
}

export const profileAPI = new ProfileGMMOApi(GMMOServerURL, GMMORoot);
