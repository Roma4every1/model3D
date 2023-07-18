import { FunctionComponent } from 'react';
import { Table } from 'features/table';
import { Chart } from 'features/chart';
import { Map } from 'features/map';
import { Carat } from 'features/carat';


/** Словарь для выбора формы по типу; используется в компоненте `Form`. */
export const formDict: Record<string, FunctionComponent<FormState>> = {
  dataSet: Table,
  carat: Carat,
  chart: Chart,
  map: Map,
};
