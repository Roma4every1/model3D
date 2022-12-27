import { FunctionComponent } from "react";

import Carat from "../components/forms/carat/carat";
import Chart from "../components/forms/chart/chart";
import DataSet from "../components/forms/dataset/dataset";
import Files from "../components/forms/files";
import FilesList from "../components/forms/files-list";
import Grid from "../components/forms/grid/grid";
import Image from "../components/forms/image"
import Map from "../components/forms/map/map"
import Model3D from "../components/forms/model3d";
import Profile from "../components/forms/profile";
import Screenshot from "../components/forms/screenshot";
import Slide from "../components/forms/slide";
import Spreadsheet from "../components/forms/spreadsheet";
import SpreadsheetUnite from "../components/forms/spreadsheet-unite";
import TransferForm from "../components/forms/transfer-form";


/** Словарь для выбора формы по типу; используется в компоненте `Form`. */
export const formDict: {[key: string]: FunctionComponent<any>} = {
  carat: Carat,
  chart: Chart,
  dataSet: DataSet,
  files: Files,
  filesList: FilesList,
  grid: Grid,
  image: Image,
  map: Map,
  model3D: Model3D,
  profile: Profile,
  screenshot: Screenshot,
  slide: Slide,
  spreadsheet: Spreadsheet,
  spreadsheetUnite: SpreadsheetUnite,
  transferForm: TransferForm,
};
