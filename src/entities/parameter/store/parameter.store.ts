import { createWithEqualityFn } from 'zustand/traditional';
import { compareArrays, compareObjects } from 'shared/lib';


/** Хранилище глобальных параметров и параметров презентаций. */
export const useParameterStore = createWithEqualityFn((): ParamDict => ({}));

/** Глобальные параметры сессии. */
export const useGlobalParameters = () => useParameterStore(state => state.root);

/** Параметры презентации или формы. */
export const useClientParameters = (id: ClientID) => useParameterStore(state => state[id]);

/** Параметр презентации или формы. */
export function useClientParameter(client: ClientID, parameter: ParameterID) {
  const selector = (state: ParamDict) => state[client]?.find(p => p.id === parameter);
  return useParameterStore(selector);
}

export function useLocalOrGlobalParameters(id: ClientID, ids: ParameterID[]): Parameter[] {
  const selector = (state: ParamDict) => {
    if (!ids.length) return [];
    const globalParameters = state.root;
    const localParameters = state[id];

    return ids.map((parameterID) => {
      const findFn = (p: Parameter): boolean => p.id === parameterID;
      return globalParameters.find(findFn) ?? localParameters?.find(findFn) ?? null;
    });
  };
  return useParameterStore(selector, compareArrays);
}

export function useLocalOrGlobalParamValues(id: ClientID, ids: Iterable<ParameterID>): Record<ParameterID, Parameter> {
  const selector = (state: ParamDict) => {
    const dict: Record<ParameterID, Parameter> = {};
    if (!id) return dict;

    const globalParameters = state.root;
    const parentFormParameters = state[id];

    for (const paramID of ids) {
      const findByID = (param) => param.id === paramID;

      const fromGlobal = globalParameters.find(findByID);
      if (fromGlobal) { dict[paramID] = fromGlobal; continue; }

      const fromParent = parentFormParameters.find(findByID);
      if (fromParent) dict[paramID] = fromParent;
    }
    return dict;
  };
  return useParameterStore(selector, compareObjects);
}
