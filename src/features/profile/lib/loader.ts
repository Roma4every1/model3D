import type { ReqQuery } from 'shared/lib';
import { profileAPI } from './profile.api';
import { getProfileMapData } from './utils';


const builderParameters = 'PEJ1aWxkZXJQYXJhbWV0ZXJzPg0KICA8UGFyYW0gbm' +
  'FtZT0iUHJvZmlsZVNjYWxlIiB2YWx1ZT0iNSIgLz4NCiAgPFBhcmFtIG5hbWU9IldPQ0xldmVsIiB2YWx1ZT0' +
  'iMCIgLz4NCiAgPFBhcmFtIG5hbWU9IldPQ0xldmVsQ2hlY2tlZCIgdmFsdWU9IkZhbHNlIiAvPg0KICA8UGFy' +
  'YW0gbmFtZT0iUGFsZW9Qcm9maWxlRW5hYmxlZCIgdmFsdWU9IkZhbHNlIiAvPg0KICA8UGFyYW0gbmFtZT0iU' +
  'GFsZW9Qcm9maWxlUEwiIHZhbHVlPSI2MDYiIC8_DQogIDxQYXJhbSBuYW1lPSJQYWxlb1Byb2ZpbGVUb3BCYX' +
  'NlIiB2YWx1ZT0iMSIgLz4NCjwvQnVpbGRlclBhcmFtZXRlcnM_';


/** Класс, реализующий загрузку данных для профиля по трассе. */
export class ProfileLoader implements IProfileLoader {
  /** Функция для обновления состояния загрузки на уровне интерфейса. */
  public setLoading: (percentage: number, status?: string) => void;
  /** Список активных пластов */
  public activeStrata: string[];
  /** Кеш данных профиля. */
  public cache: ProfileDataCache;

  /** ID выполняющейся задачи по получению пластов. */
  private strataJobID: GMJobID | null = null;
  /** ID интервала задачи по получению пластов. */
  private strataJobInterval: number | null = null;
  /** ID выполняющейся задачи по построению профиля. */
  private profileJobID: GMJobID | null = null;
  /** ID интервала задачи по построению профиля. */
  private profileJobInterval: number | null = null;

  constructor() {
    this.setLoading = () => {};
    this.cache = {strata: [], profileData: null};
  }

  /** Очищает задачу получения профиля. */
  private async clearProfile(): Promise<void> {
    if (this.profileJobID) {
      await profileAPI.deleteJob('profile', this.profileJobID);
      window.clearInterval(this.profileJobInterval);
    }
    this.profileJobID = null;
    this.profileJobInterval = null;
  }

  /** Очищает задачу получения пластов. */
  private async clearStrata(): Promise<void> {
    if (this.strataJobID) {
      await profileAPI.deleteJob('pl', this.strataJobID);
      window.clearInterval(this.strataJobInterval);
    }
    this.profileJobID = null;
    this.profileJobInterval = null;
  }

  /** Получает набор данных для построения профиля по трассе и записывает их в кэш. */
  public async loadProfileData(objects: GMJobObjectParameters): Promise<void> {
    await this.clearProfile();
    this.setLoading(0);

    if (!this.activeStrata?.length) return;
    if (!objects?.trace?.nodes?.length) return;

    const profileJobParams = this.getProfileJobParams(objects);
    if (!profileJobParams) return;

    this.profileJobID = await profileAPI.createJob('profile', profileJobParams);
    if (!this.profileJobID) return;

    let counter = 0;
    this.profileJobInterval = window.setInterval(async () => {
      const progress = await profileAPI.getJobProgress('profile', this.profileJobID);
      if (!progress?.percent) return;
      const data = await profileAPI.getJobResult<GMProfileResult>('profile', this.profileJobID);
      if (!data) return;

      const loadingMessage = progress?.message?.replace('|', '\n');
      this.setLoading(Math.floor(progress.percent * 2), loadingMessage);
      const layers = data.profileInnerContainer.layers;

      if (Object.keys(layers).length > 0) {
        await this.clearProfile();
        this.cache.profileData = await getProfileMapData(layers);
        this.setLoading(100);
      }
      if (counter > 60) {
        this.setLoading(100);
        await this.clearProfile();
      }
      ++counter;
    }, 3000);
  }

  /** Получает список пластов для построения профиля по трассе и записывает их в кэш. */
  public async loadStrata(objects: GMJobObjectParameters): Promise<void> {
    this.activeStrata = [];
    await this.clearProfile();
    await this.clearStrata();

    const plJobParams = this.getPlJobParams(objects);
    if (!plJobParams) return;

    this.strataJobID = await profileAPI.createJob('pl', plJobParams);
    if (!this.strataJobID) return;

    let counter = 0;
    this.strataJobInterval = window.setInterval(async () => {
      const data = await profileAPI.getJobResult<GMStrataResult>('pl', this.strataJobID);
      if (!data) return;

      if (data?.plast || counter > 10) {
        await this.clearStrata();
        this.cache.strata = data.plast;
      }
      ++counter;
    }, 1000);
  }

  /** Создает ReqQuery для задачи получения списка доступных пластов. */
  private getPlJobParams(objects: GMJobObjectParameters): ReqQuery {
    if (!objects || !objects.stratum || !objects.place) return null;
    return {objectCode: objects.place.code, plastCode: String(objects.stratum.id), mapCode: 'TOP'};
  }

  /** Создает ReqQuery для задачи получения данных профиля. */
  private getProfileJobParams(objects: GMJobObjectParameters): ReqQuery {
    const plJobParams = this.getPlJobParams(objects);
    if (!plJobParams) return null;
    if (!objects?.trace?.nodes?.length) return null;
    if (!this.activeStrata?.length) return null;

    const trace = objects.trace.nodes.map(n => n.name).join(', ');
    const strata = this.activeStrata.join(',');
    return {...plJobParams, trace, plastList: strata, builderParameters, nativeFormat: '0'};
  }
}
