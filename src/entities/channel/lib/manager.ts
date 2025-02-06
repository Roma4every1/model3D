import type { Res } from 'shared/lib';
import { serializeParameter } from 'entities/parameter';
import { updateChannelLookupColumns } from './utils';
import { channelAPI } from './channel.api';


/** Состояние задачи по обновлению данных канала. */
interface UpdateTask {
  /** Идентификатор обновляемого канала. */
  readonly id: ChannelID;
  /** Настройки запроса. */
  readonly query: ChannelQuerySettings;
  /** Значения параметров. */
  readonly payload: SerializedParameter[];
  /** Промис с результатом: `false` означает, что загрузка была отменена. */
  readonly promise: Promise<boolean>;
  /** Колбэк завершения задачи. */
  readonly resolve: (updated: boolean) => void;
  /** Контроллер прерывания для реализации отмены. */
  readonly abortController: AbortController;
}

/** Класс, управляющий обновлением данных каналов. */
export class ChannelDataManager {
  /** Состояние выполяемых тасков. */
  private readonly tasks: Map<ChannelID, UpdateTask> = new Map();
  /** Хранилище объектов каналов. */
  private storage: ChannelDict;

  constructor(storage: ChannelDict) {
    this.storage = storage;
    this.tasks = new Map();
  }

  public reset(storage: ChannelDict): void {
    const ids = [...this.tasks.keys()];
    ids.forEach(id => this.cancelUpdate(id));
    this.storage = storage;
  }

  public update(channel: Channel, parameters: Parameter[], force?: boolean): Promise<boolean> {
    const task = this.tasks.get(channel.id);
    const payload = parameters.map(serializeParameter);

    if (task) {
      const same = !force
        && compareParameters(task.payload, payload)
        && compareQuery(task.query, channel.query);

      if (same) return task.promise;
      this.cancelUpdate(channel.id);
    }
    return this.addTask(channel, payload).promise;
  }

  public cancelUpdate(id: ChannelID): void {
    const task = this.tasks.get(id);
    if (!task) return;

    task.abortController.abort();
    task.resolve(false);
    this.tasks.delete(id);
  }

  private addTask(channel: Channel, payload: SerializedParameter[]): UpdateTask {
    const { id, name, query } = channel;
    const { promise, resolve } = Promise.withResolvers<boolean>();

    const abortController = new AbortController();
    const task: UpdateTask = {id, query, payload, abortController, promise, resolve};

    channelAPI.getChannelData(name, payload, query, abortController.signal)
      .then((data: Res<ChannelData>) => this.resolve(task, data))
      .catch(() => {});

    this.tasks.set(id, task);
    return task;
  }

  private resolve(task: UpdateTask, res: Res<ChannelData>): void {
    const id = task.id;
    const channel = {...this.storage[id]};

    if (res.ok) {
      channel.data = res.data;
      updateChannelLookupColumns(channel);
    } else {
      channel.data = null;
    }
    channel.actual = true;

    this.storage[id] = channel;
    this.tasks.delete(id);
    task.resolve(true);
  }
}

function compareParameters(a: SerializedParameter[], b: SerializedParameter[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    const ap = a[i], bp = b[i];
    if (ap.id !== bp.id || ap.value !== bp.value) return false;
  }
  return true;
}
function compareQuery(a: ChannelQuerySettings, b: ChannelQuerySettings): boolean {
  return a.limit === b.limit && a.filter === b.filter && a.order === b.order;
}
