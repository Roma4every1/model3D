import {profileAPI} from "./profile-gmmo.api.ts";
import {getProfileMapData} from "./utils.ts";
import {GMMOBuilderParameters} from "./constants.ts";

/** Класс, реализующий загрузку данных для профиля по трассе. */
export class ProfileLoader implements IProfileLoader {
  /** Флаг для преждевременной остановки загрузки. */
  public flag: number;
  /** Функция для обновления состояния загрузки на уровне интерфейса. */
  public setLoading: (l: Partial<CaratLoading>) => void;

  /** Максимальное количество запросов result для пластов. */
  private maxPlJobCounter = 10;
  /** Максимальное количество запросов result для профиля. */
  private maxProfileJobCounter = 60;

  /** Максимальный интервал запросов result для пластов. */
  private maxPlJobInterval = 1000;
  /** Максимальный интервал запросов result для профиля. */
  private maxProfileJobInterval = 3000;

  /** Список активных пластов */
  public activePlasts: string[];

  /** ID выполняющейся задачи по получению пластов. */
  private currentPlJobId = null;
  /** ID выполняющейся задачи по построению профиля. */
  private currentProfileJobId = null;

  /** ID интервала задачи по получению пластов. */
  private currentPlJobInterval = null;
  /** ID интервала задачи по построению профиля. */
  private currentProfileJobInterval = null;

  /** Кеш данных профиля. */
  public cache: ProfileDataCache;

  constructor() {
    this.flag = 0;
    this.setLoading = () => {};
    this.cache = {
      plasts: [],
      profileData: null
    };
  }

  /** Очищает все данные загрузчика кроме кэша. */
  private async clear() {
    this.activePlasts = [];
    await this.clearProfile();
    await this.clearPlasts();
  }

  /** Очищает задачу получения профиля. */
  private async clearProfile() {
    if (this.currentProfileJobId) {
      await profileAPI.deleteGMMOJob('profile', this.currentProfileJobId);
      clearInterval(this.currentProfileJobInterval);
    }

    this.currentProfileJobId = null;
    this.currentProfileJobInterval = null;
  }

  /** Очищает задачу получения пластов. */
  private async clearPlasts() {
    if (this.currentPlJobId) {
      await profileAPI.deleteGMMOJob('pl', this.currentPlJobId);
      clearInterval(this.currentPlJobInterval);
    }

    this.currentProfileJobId = null;
    this.currentProfileJobInterval = null;
  }

  /** Получает набор данных для построения профиля по трассе и записывает их в кэш. */
  public async loadProfileData(objects: GMMOJobObjectParameters) {
    await this.clearProfile();
    this.setLoading({percentage: 0});

    if (!this.activePlasts?.length) return;
    if (!objects?.trace?.nodes?.length) return;

    const profileJobParams = this.getProfileJobParams(objects);
    if (!profileJobParams) return;

    this.currentProfileJobId = await profileAPI.createGMMOJob('profile', profileJobParams);

    let counter = 0;
    this.currentProfileJobInterval = setInterval(async () => {
      const progress =
        await profileAPI.getProgressGMMOJob('profile', this.currentProfileJobId);
      const {data} =
        await profileAPI.getResultGMMOJob('profile', this.currentProfileJobId);
      if (!progress?.percent) return;

      if (typeof data === 'string') return;
      const profileData = data as GMMOProfileDataResult;

      const loadingMessage = progress?.message?.replace('|', '\n');
      this.setLoading({percentage: Math.floor(progress.percent * 2), status: loadingMessage});
      const layers = profileData.profileInnerContainer.layers;
      if (Object.keys(layers).length > 0) {
        await this.clearProfile();

        this.cache.profileData = await getProfileMapData(layers);
        this.setLoading({percentage: 100});
      }

      if (counter > this.maxProfileJobCounter) {
        this.setLoading({percentage: 100});
        await this.clearProfile();
      }

      counter++;
    }, this.maxProfileJobInterval);
  }

  /** Получает список пластов для построения профиля по трассе и записывает их в кэш. */
  public async loadPlData(objects: GMMOJobObjectParameters) {
    await this.clear();

    const plJobParams: ReqQuery = this.getPlJobParams(objects);
    if (!plJobParams) return;

    this.currentPlJobId = await profileAPI.createGMMOJob('pl', plJobParams);

    let counter = 0;
    this.currentPlJobInterval = setInterval(async () => {
      const {data} = await profileAPI.getResultGMMOJob('pl', this.currentPlJobId);

      if (typeof data === 'string') return;
      const plJobData = data as GMMOPlastsJobDataResult;

      if (plJobData?.plast || counter > this.maxPlJobCounter) {
        await this.clearPlasts();
        this.cache.plasts = plJobData.plast;
      }

      counter++;
    }, this.maxPlJobInterval);
  }

  /** Создает ReqQuery для задачи получения списка доступных пластов. */
  private getPlJobParams(objects: GMMOJobObjectParameters): ReqQuery {
    if (!objects?.stratum || !objects?.place) return null;
    return {
      objectCode: objects.place.objectName,
      plastCode: objects.stratum.id.toString(),
      mapCode: 'TOP',
    } as ReqQuery;
  }

  /** Создает ReqQuery для задачи получения данных профиля. */
  private getProfileJobParams(objects: GMMOJobObjectParameters): ReqQuery {
    const plJobParams = this.getPlJobParams(objects);
    if (!plJobParams) return null;
    if (!objects?.trace?.nodes?.length) return null;
    if (!this.activePlasts?.length) return null;
    return {
      ...plJobParams,
      trace: objects.trace.nodes.map(n => n.name).join(', '),
      plastList: this.activePlasts.join(','),
      nativeFormat: '0',
      builderParameters: GMMOBuilderParameters,
    } as ReqQuery;
  }
}
