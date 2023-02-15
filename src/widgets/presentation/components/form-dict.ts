import { FunctionComponent } from 'react';
import { NotSupportedForm } from './plugs';
import { Chart } from 'features/chart';
import { Map } from 'features/map';
// import { Carat } from 'features/carat';


/** Словарь для выбора формы по типу; используется в компоненте `Form`.
 *
 * **Не содержит типы `dock`, `grid`, `dataSet` и `multiMap`.**
 * */
export const formDict: Record<string, FunctionComponent<FormState>> = {
  carat: NotSupportedForm,
  chart: Chart,
  files: NotSupportedForm,
  filesList: NotSupportedForm,
  image: NotSupportedForm,
  map: Map,
  model3D: NotSupportedForm,
  profile: NotSupportedForm,
  slide: NotSupportedForm,
  spreadsheet: NotSupportedForm,
  spreadsheetUnite: NotSupportedForm,
  transferForm: NotSupportedForm,
};
