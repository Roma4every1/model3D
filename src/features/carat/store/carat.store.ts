import { create } from 'zustand';
import { CaratStage } from '../rendering/stage';
import { CaratLoader } from '../lib/loader';


/** Хранилище каротажных диаграмм. */
export type CaratStates = Record<FormID, CaratState>;

/** Состояние каротажной формы. */
export interface CaratState {
  /** Экземпляр класса сцены. */
  readonly stage: CaratStage;
  /** Класс, реализующий загрузку данных для построения каротажа по трассе. */
  readonly loader: CaratLoader;
  /** Класс для отслеживания изменения размеров холста. */
  readonly observer: ResizeObserver;
  /** Список всех используемых каналов. */
  readonly channels: ChannelID[];
  /** Список всех используемых каналов-справочников. */
  readonly lookups: ChannelID[];
  /** Ссылка на холст. */
  canvas: HTMLCanvasElement;
  /** Находится ли форма в состоянии загрузки. */
  loading: CaratLoading;
}

/** Хранилище каротажных диаграмм. */
export const useCaratStore = create((): CaratStates => ({}));

/** Состояние каротажной формы. */
export const useCaratState = (id: FormID) => useCaratStore(state => state[id]);
