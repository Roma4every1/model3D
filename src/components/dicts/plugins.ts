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

import ProgramButton from "../forms/Grid/Plugins/SqlPrograms/ProgramButton";
import ProgramParametersButton from "../forms/Grid/Plugins/SqlPrograms/ProgramParametersButton";
import ProgramParametersList from "../forms/Grid/Plugins/SqlPrograms/ProgramParametersList";
import SqlProgramsList from "../forms/Grid/Plugins/SqlPrograms/SqlProgramsList";

import GridParametersList from "../forms/Grid/Plugins/ParametersList";

/* Map plugins */

import AttrTableWindow from "../forms/Map/Plugins/Editing/AttrTableWindow";
import CreateElementWindow from "../forms/Map/Plugins/Editing/CreateElementWindow";
import Editing from "../forms/Map/Plugins/Editing/Editing";
import EditWindow from "../forms/Map/Plugins/Editing/EditWindow";
import FillNameTemplate from "../forms/Map/Plugins/Editing/FillNameTemplate";
import LabelPropertiesWindow from "../forms/Map/Plugins/Editing/LabelPropertiesWindow";
import PolylinePropertiesWindow from "../forms/Map/Plugins/Editing/PolylinePropertiesWindow";
import PropertiesWindow from "../forms/Map/Plugins/Editing/PropertiesWindow";
import StyleTemplate from "../forms/Map/Plugins/Editing/StyleTemplate";

import SublayerStatisticsWindow from "../forms/Map/Plugins/SublayersTree/SublayerStatisticsWindow";
import SublayersTree from "../forms/Map/Plugins/SublayersTree/SublayersTree";
import SublayersTreeElement from "../forms/Map/Plugins/SublayersTree/SublayersTreeElement";
import SublayersTreeLayer from "../forms/Map/Plugins/SublayersTree/SublayersTreeLayer";

import Dimensions from "../forms/Map/Plugins/Dimensions";
import DimensionsView from "../forms/Map/Plugins/DimensionsView";
import ExportToPdf from "../forms/Map/Plugins/ExportToPdf";
import MapToFullViewport from "../forms/Map/Plugins/MapToFullViewport";
import Selecting from "../forms/Map/Plugins/Selecting";

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
    'SqlPrograms/ProgramButton': ProgramButton,
    'SqlPrograms/ProgramParametersButton': ProgramParametersButton,
    'SqlPrograms/ProgramParametersList': ProgramParametersList,
    'SqlPrograms/SqlProgramsList': SqlProgramsList,
    'ParametersList': GridParametersList,
  },
  map: {
    'Editing/AttrTableWindow': AttrTableWindow,
    'Editing/CreateElementWindow': CreateElementWindow,
    'Editing/Editing': Editing,
    'Editing/EditWindow': EditWindow,
    'Editing/FillNameTemplate': FillNameTemplate,
    'Editing/LabelPropertiesWindow': LabelPropertiesWindow,
    'Editing/PolylinePropertiesWindow': PolylinePropertiesWindow,
    'Editing/PropertiesWindow': PropertiesWindow,
    'Editing/StyleTemplate': StyleTemplate,
    'SublayersTree/SublayerStatisticsWindow': SublayerStatisticsWindow,
    'SublayersTree/SublayersTree': SublayersTree,
    'SublayersTree/SublayersTreeElement': SublayersTreeElement,
    'SublayersTree/SublayersTreeLayer': SublayersTreeLayer,
    Dimensions,
    DimensionsView,
    ExportToPdf,
    MapToFullViewport,
    Selecting,
  },
}
