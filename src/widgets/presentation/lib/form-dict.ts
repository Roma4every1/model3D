import { FunctionComponent } from 'react';
import { AnyAction } from 'redux';

import { Table, createTableState } from 'features/table';
import { Chart, createChartState } from 'features/chart';
import { Map, createMapState } from 'features/map';
import { Carat, createCaratState } from 'features/carat';


type SupportedFormDict<T> = Record<SupportedFormType, T>;
type FormStateCreator = (payload: FormStatePayload) => AnyAction;


/** Словарь компонентов форм; используется в компоненте `Form`. */
export const formDict: SupportedFormDict<FunctionComponent<FormState>> = {
  'dataSet': Table,
  'carat': Carat,
  'chart': Chart,
  'map': Map,
};

/** Словарь функций-экшенов для создания состояния форм. */
export const createFormDict: SupportedFormDict<FormStateCreator> = {
  'dataSet': createTableState,
  'carat': createCaratState,
  'chart': createChartState,
  'map': createMapState,
};
