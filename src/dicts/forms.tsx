import { FunctionComponent } from "react";
import { Grid } from "../components/forms/grid/grid";
import { Chart } from "../components/forms/chart/chart";
import { Map } from "../components/forms/map/map";
// import { Carat } from "../components/forms/carat/carat";
// import { Model3D } from "../components/forms/model3d";


/** Заглушка для не поддерживаемых форм. */
const NotSupportedForm = () => {
  return <div className={'map-not-found'}>Данный тип формы не поддерживается</div>;
};

/** Словарь для выбора формы по типу; используется в компоненте `Form`.
 *
 * **Не содержит типы `dock`, `dataSet` и `multiMap`.**
 * */
export const formDict: Record<string, FunctionComponent<FormProps>> = {
  carat: NotSupportedForm,
  chart: Chart,
  files: NotSupportedForm,
  filesList: NotSupportedForm,
  grid: Grid,
  image: NotSupportedForm,
  map: Map,
  model3D: NotSupportedForm,
  profile: NotSupportedForm,
  slide: NotSupportedForm,
  spreadsheet: NotSupportedForm,
  spreadsheetUnite: NotSupportedForm,
  transferForm: NotSupportedForm,
};
