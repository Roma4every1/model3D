import { FunctionComponent } from "react";

/* --- Dock Plugins --- */

import Menu from "../forms/Dock/Plugins/Menu";
import DownloadFiles from "../forms/Dock/Plugins/DownloadFiles/DownloadFiles";
import DateChanging from "../forms/Dock/Plugins/DateChanging";

/* --- Grid Plugins --- */

import SqlProgramsList from "../forms/Grid/Plugins/SqlPrograms/SqlProgramsList";

/* --- DataSet Plugins --- */

import ExportToExcel from "../forms/DataSet/Plugins/ExportToExcel";
import SelectAllRec from "../forms/DataSet/Plugins/SelectAllRec";
import Statistics from "../forms/DataSet/Plugins/Statistics";
import ColumnSettings from "../forms/DataSet/Plugins/ColumnSettings";
import ColumnsVisibility from "../forms/DataSet/Plugins/ColumnsVisibility";
import ColumnHeaderSetter from "../forms/DataSet/Plugins/ColumnHeaderSetter";
import ColumnSettingsAnalyzer from "../forms/DataSet/Plugins/ColumnSettingsAnalyzer";

/* --- Map Plugins --- */

import MapEditPanel from "../forms/Map/Plugins/map-edit-panel";
import MapLayersTree from "../forms/Map/Plugins/layers-tree/layers-tree";

/* --- Chart Plugins --- */

import ChartEditPanel from "../forms/Chart/Plugins/chart-edit-panel";

/* --- Carat Plugins ---- */

import CaratEditPanel from "../forms/Carat/carat-edit-panel";

/* --- --- --- */

/** Типы форм, для которых есть плагины. */
type PluginFormType = 'dock' | 'grid' | 'dataset' | 'map' | 'chart' | 'carat';
/** Словарь react-компонентов. */
type ComponentsDict = Record<string, FunctionComponent>;


/** Словарь для выбора плагинов по типу формы и названию. */
export const pluginsDict: Record<PluginFormType, ComponentsDict> = {
  dock: {
    'Menu': Menu,
    'DownloadFiles': DownloadFiles,
    'DateChanging': DateChanging,
  },
  grid: {
    'SqlPrograms/SqlProgramsList': SqlProgramsList,
  },
  dataset: {
    'ExportToExcel': ExportToExcel,
    'SelectAllRec': SelectAllRec,
    'Statistics': Statistics,
    'ColumnSettings': ColumnSettings,
    'ColumnsVisibility': ColumnsVisibility,
    'ColumnHeaderSetter': ColumnHeaderSetter,
    'ColumnSettingsAnalyzer': ColumnSettingsAnalyzer,
  },
  map: {
    'LayersTree': MapLayersTree,
    'MapEditPanel': MapEditPanel,
  },
  chart: {
    'ChartEditPanel': ChartEditPanel,
  },
  carat: {
    'CaratEditPanel': CaratEditPanel,
  }
};
