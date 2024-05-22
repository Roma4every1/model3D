/** Вспомогательный класс, реализующий архитектурный шаблон Event Bus. */
export class EventBus<K extends PropertyKey = string, M extends Record<K, any> = Record<K, any>> {
  /** Хранилище слушателей событий. */
  private readonly storage: Record<K, Set<EventCallback<M[K]>>> = {} as any;

  /** Подписка на событие. */
  public subscribe<T extends K>(event: T, callback: EventCallback<M[T]>): void {
    let listeners = this.storage[event];
    if (!listeners) { listeners = new Set(); this.storage[event] = listeners; }
    listeners.add(callback);
  }

  /** Отписка от события. */
  public unsubscribe<T extends K>(event: T, callback: EventCallback<M[T]>): void {
    const listeners = this.storage[event];
    if (listeners) listeners.delete(callback);
  }

  /** Отправка событий подписчикам. */
  public publish<T extends K>(event: T, arg: M[T]): void {
    const listeners = this.storage[event];
    if (listeners && listeners.size) listeners.forEach(l => l(arg));
  }
}
