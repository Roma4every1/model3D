import type { StrataJobOptions, ProfileJobOptions, BuilderParameters } from './profile.api';
import { sleep } from 'shared/lib';
import { getProfileMapData } from './utils';
import { profileAPI } from './profile.api';


interface JobState<T> {
  /** ID выполняющейся задачи. */
  id: GMJobID | null;
  /** Promise и методы завершения. */
  handle?: PromiseWithResolvers<T>;
}

interface StrataJobResult {
  plast?: {name: string, code: string, selected: string}[];
}
interface ProfileJobResult {
  profileInnerContainer: {layers: Record<string, GMRawLayerData>};
}


/** Класс, реализующий загрузку данных для профиля по трассе. */
export class ProfileLoader implements IProfileLoader {
  /** Функция для обновления состояния загрузки на уровне интерфейса. */
  public setLoading: (percentage: number, status?: string) => void;
  /** Состояние задачи по расчёту списка пластов. */
  private strataJob: JobState<ProfileStratum[]>;
  /** Состояние задачи по построению профиля. */
  private profileJob: JobState<MapData>;

  public async loadStrata(objects: ProfileObjects): Promise<ProfileStratum[]> {
    if (this.strataJob) this.stopWatchStrata(this.strataJob, 'abort');
    if (this.profileJob) this.stopWatchProfile(this.profileJob, 'abort');

    const handle = Promise.withResolvers<ProfileStratum[]>();
    this.strataJob = {id: null, handle};

    const id = await profileAPI.createStrataJob(this.getStrataJobOptions(objects));
    if (id) {
      this.strataJob.id = id;
      this.watchStrata(this.strataJob).then();
    } else {
      handle.reject(new Error('job-create'));
    }
    return handle.promise;
  }

  private async watchStrata(job: JobState<ProfileStratum[]>): Promise<void> {
    for (let i = 0; i < 10; ++i) {
      await sleep(1000);
      if (this.strataJob !== job) return this.stopWatchStrata(job, 'abort');

      const result = await profileAPI.getJobResult<StrataJobResult>('pl', job.id);
      if (this.strataJob !== job) return this.stopWatchStrata(job, 'abort');

      if (result === false) return this.stopWatchStrata(job, 'job-result');
      const data = result?.plast;
      if (!data) continue;

      data.forEach((s: any) => { s.selected = s.selected === '1'; });
      return this.strataJob.handle.resolve(data as any[]);
    }
    this.stopWatchStrata(job, 'timeout');
  }

  /** Очищает задачу получения пластов. */
  private stopWatchStrata(job: JobState<ProfileStratum[]>, reason: string): void {
    profileAPI.deleteJob('pl', job.id).then();
    job.handle.reject(new Error(reason));
    if (this.strataJob === job) this.strataJob = null;
  }

  private getStrataJobOptions(objects: ProfileObjects): StrataJobOptions {
    return {
      organizationCode: 'dbmm_tat$1', objectCode: objects.place.code,
      plastCode: String(objects.stratum.id), mapCode: 'TOP',
    };
  }

  /* --- --- */

  public async loadProfile(objects: ProfileObjects, strata: string[], ratio: number): Promise<MapData> {
    if (this.profileJob) this.stopWatchProfile(this.profileJob, 'abort');
    this.setLoading(0);

    const handle = Promise.withResolvers<MapData>();
    this.profileJob = {id: null, handle};

    const id = await profileAPI.createProfileJob(this.getProfileJobOptions(objects, strata, ratio));
    if (id) {
      this.profileJob.id = id;
      this.watchProfile(this.profileJob).then();
    } else {
      handle.reject(new Error('job-create'));
    }
    return handle.promise;
  }

  private async watchProfile(job: JobState<MapData>): Promise<void> {
    for (let i = 0; i < 60; ++i) {
      await sleep(4000);
      if (this.profileJob !== job) return this.stopWatchProfile(job, 'abort');

      const progress = await profileAPI.getJobProgress('profile', job.id);
      if (this.profileJob !== job) return this.stopWatchProfile(job, 'abort');

      if (progress?.percent) {
        const loadingMessage = progress?.message?.replaceAll('|', '\n');
        this.setLoading(Math.floor(progress.percent * 2), loadingMessage);
      }

      const result = await profileAPI.getJobResult<ProfileJobResult>('profile', job.id);
      if (this.profileJob !== job) return this.stopWatchProfile(job, 'abort');

      if (result === false) return this.stopWatchProfile(job, 'job-result');
      const layers = result?.profileInnerContainer?.layers;

      if (layers && Object.keys(layers).length > 0) {
        const data = await getProfileMapData(layers);
        return this.profileJob.handle.resolve(data);
      }
    }
    this.stopWatchProfile(job, 'timeout');
  }

  /** Очищает задачу получения профиля. */
  private stopWatchProfile(job: JobState<MapData>, reason: string): void {
    profileAPI.deleteJob('profile', job.id).then();
    job.handle.reject(new Error(reason));
    if (this.profileJob === job) this.profileJob = null;
  }

  private getProfileJobOptions(objects: ProfileObjects, strata: string[], ratio: number): ProfileJobOptions {
    const builderParameters: BuilderParameters = {
      ProfileScale: ratio, WOCLevel: 0, WOCLevelChecked: 'False',
      PaleoProfileEnabled: 'False', PaleoProfilePL: 606, PaleoProfileTopBase: 1,
    };
    return {
      trace: objects.trace.nodes.map(n => n.name).join(', '),
      plastList: strata.join(','),
      organizationCode: 'dbmm_tat$1', objectCode: String(objects.place.code),
      plastCode: String(objects.stratum.id), mapCode: 'TOP',
      builderParameters, nativeFormat: '0',
    };
  }
}
