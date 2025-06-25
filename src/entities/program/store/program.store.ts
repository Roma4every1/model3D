import { create } from 'zustand';


/** Состояние отчётов и программ. */
interface ProgramStore {
  /** Модели отчётов и программ по презентациям. */
  models: Record<ClientID, Program[]>;
  /** Активные операции. */
  operations: OperationStatus[];
  /** Сущность, управляющая разметкой приложения. */
  layoutController: IMainLayoutController;
}

/** Состояние отчётов и программ. */
export const useProgramStore = create((): ProgramStore => ({
  models: {},
  operations: [],
  layoutController: null,
}));

/** Список программ активной презентации. */
export function usePrograms(id: ClientID): Program[] {
  return useProgramStore(state => state.models[id]);
}
/** Список активных операций. */
export function useOperations(): OperationStatus[] {
  return useProgramStore(state => state.operations);
}
