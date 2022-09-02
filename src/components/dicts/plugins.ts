import { FunctionComponent } from "react";

/* Chart plugins */

import SeriesSettings from "../forms/Chart/Plugins/SeriesSettings";

/* DataSet plugins */

import ColumnHeaderLabelSetter from "../forms/DataSet/Plugins/ColumnHeaderLabelSetter";
import ColumnHeaderSetter from "../forms/DataSet/Plugins/ColumnHeaderSetter";
import ColumnSettings from "../forms/DataSet/Plugins/ColumnSettings";
import ColumnSettingsAnalyzerItem from "../forms/DataSet/Plugins/ColumnSettingsAnalyzerItem";
import ColumnSettingsAnalyzer from "../forms/DataSet/Plugins/ColumnSettingsAnalyzer";
import ColumnsVisibility from "../forms/DataSet/Plugins/ColumnsVisibility";
import ColumnsVisibilityContent from "../forms/DataSet/Plugins/ColumnsVisibilityContent";

import ExportToExcel from "../forms/DataSet/Plugins/ExportToExcel";
import SelectAllRec from "../forms/DataSet/Plugins/SelectAllRec";
import Statistics from "../forms/DataSet/Plugins/Statistics";

/* Dock plugins */

import DownloadFileItem from "../forms/Dock/Plugins/DownloadFiles/DownloadFileItem";
import DownloadFiles from "../forms/Dock/Plugins/DownloadFiles/DownloadFiles";

import DateChanging from "../forms/Dock/Plugins/DateChanging";
import DateChangingRule from "../forms/Dock/Plugins/DateChangingRule";
import Menu from "../forms/Dock/Plugins/Menu";
import PanelButtons from "../forms/Dock/Plugins/PanelButtons";
import DockParametersList from "../forms/Dock/Plugins/ParametersList";
import PresentationList from "../forms/Dock/Plugins/PresentationList";
import RecursiveTreeView from "../forms/Dock/Plugins/RecursiveTreeView";

/* Grid plugins */

import SqlProgramsList from "../forms/Grid/Plugins/SqlPrograms/SqlProgramsList";
import GridParametersList from "../forms/Grid/Plugins/ParametersList";

/* Map plugins */

import MapEditPanel from "../forms/Map/Plugins/MapEditPanel";
import SublayersTree from "../forms/Map/Plugins/SublayersTree/SublayersTree";

/* --- --- --- */

/**
 * Словарь для выбора плагинов по типу формы и названию.
 *
 * Используется в компонентах:
 * + `Form`
 * + `Dock`
 * + `DockPluginStrip`
 * */
export const pluginsDict: {[key: string]: {[key: string]: FunctionComponent}} = {
  chart: {
    SeriesSettings
  },
  dataset: {
    ColumnHeaderLabelSetter,
    ColumnHeaderSetter,
    ColumnSettings,
    ColumnSettingsAnalyzer,
    ColumnSettingsAnalyzerItem,
    ColumnsVisibility,
    ColumnsVisibilityContent,
    ExportToExcel,
    SelectAllRec,
    Statistics,
  },
  dock: {
    'DownloadFiles/DownloadFileItem': DownloadFileItem,
    'DownloadFiles/DownloadFiles': DownloadFiles,
    DateChanging,
    DateChangingRule,
    Menu,
    PanelButtons,
    'ParametersList': DockParametersList,
    PresentationList,
    RecursiveTreeView,
  },
  grid: {
    'SqlPrograms/SqlProgramsList': SqlProgramsList,
    'ParametersList': GridParametersList,
  },
  map: {
    'SublayersTree/SublayersTree': SublayersTree,
    'MapEditPanel': MapEditPanel,
  },
}
