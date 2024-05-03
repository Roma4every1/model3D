import { create } from 'zustand';
import { CaratStage } from '../rendering/stage';
import { CaratLoader } from '../lib/loader';


/** Хранилище каротажных диаграмм. */
export type CaratStates = Record<FormID, CaratState>;

/** Состояние каротажной формы. */
export interface CaratState {
  /** Ссылка на холст. */
  canvas: HTMLCanvasElement;
  /** Экземпляр класса сцены. */
  stage: CaratStage;
  /** Класс, реализующий загрузку данных для построения каротажа по трассе. */
  loader: CaratLoader;
  /** Класс для отслеживания изменения размеров холста. */
  observer: ResizeObserver;
  /** Список всех используемых каналов. */
  channelNames: ChannelName[];
  /** Список всех названий каналов-справочников. */
  lookupNames: ChannelName[];
  /** Находится ли форма в состоянии загрузки. */
  loading: CaratLoading;
}

/** Хранилище каротажных диаграмм. */
export const useCaratStore = create((): CaratStates => ({}));

/** Состояние каротажной формы. */
export const useCaratState = (id: FormID) => useCaratStore(state => state[id]);
