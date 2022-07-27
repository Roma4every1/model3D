import { FunctionComponent } from "react";

import Carat from "../forms/Carat";
import Chart from "../forms/Chart";
import DataSet from "../forms/DataSet";
import Dock from "../forms/Dock";
import Files from "../forms/Files";
import FilesList from "../forms/FilesList";
import Grid from "../forms/Grid";
import Image from "../forms/Image"
import Map from "../forms/Map"
import Model3D from "../forms/Model3D";
import Profile from "../forms/Profile";
import Screenshot from "../forms/Screenshot";
import Slide from "../forms/Slide";
import Spreadsheet from "../forms/Spreadsheet";
import SpreadsheetUnite from "../forms/SpreadsheetUnite";
import TransferForm from "../forms/TransferForm";


/** Словарь для выбора формы по типу; используется в компоненте `Form`. */
export const formDict: {[key: string]: FunctionComponent} = {
  carat: Carat,
  chart: Chart,
  dataSet: DataSet,
  dock: Dock,
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
}
