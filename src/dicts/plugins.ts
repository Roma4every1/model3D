import { FunctionComponent } from "react";

/* --- Dock Plugins --- */

import Menu from "../components/forms/dock/plugins/menu";
import DownloadFiles from "../components/forms/dock/plugins/download-files/download-files";
import DateChanging from "../components/forms/dock/plugins/date-changing";

/* --- Grid Plugins --- */

import SqlProgramsList from "../components/forms/grid/plugins/sql-programs/sql-programs-list";

/* --- DataSet Plugins --- */

import ExportToExcel from "../components/forms/dataset/plugins/export-to-excel";
import SelectAllRec from "../components/forms/dataset/plugins/select-all-rec";
import Statistics from "../components/forms/dataset/plugins/statistics";
import ColumnSettings from "../components/forms/dataset/plugins/column-settings";
import ColumnsVisibility from "../components/forms/dataset/plugins/columns-visibility";
import ColumnHeaderSetter from "../components/forms/dataset/plugins/column-header-setter";
import ColumnSettingsAnalyzer from "../components/forms/dataset/plugins/column-settings-analyzer";

/* --- Map Plugins --- */

import MapEditPanel from "../components/forms/map/plugins/map-edit-panel";
import MapLayersTree from "../components/forms/map/plugins/layers-tree/layers-tree";

/* --- Chart Plugins --- */

import ChartEditPanel from "../components/forms/chart/chart-edit-panel";

/* --- Carat Plugins ---- */

import CaratEditPanel from "../components/forms/carat/carat-edit-panel";

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
