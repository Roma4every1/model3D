/** Перечисление состояний загрузки. */
export enum FetchStatus {
  /** Данные не загружены. */
  NEED = -1,
  /** Данные загружаются. */
  PROCESSING = 0,
  /** Данные успешно загружены. */
  SUCCESS = 1,
  /** При загрузке произошла ошибка. */
  ERROR = 2,
}

/** Состояние загрузки. */
export class FetchState {
  private readonly status: FetchStatus;
  public readonly details: string;

  constructor(status: FetchStatus, details?: string) {
    this.status = status;
    if (details) this.details = details;
  }

  public needFetch(): boolean {
    return this.status === FetchStatus.NEED;
  }

  public notLoaded(): boolean {
    return this.status <= FetchStatus.PROCESSING;
  }

  public ok(): boolean {
    return this.status === FetchStatus.SUCCESS;
  }

  public error(): boolean {
    return this.status === FetchStatus.ERROR;
  }
}
