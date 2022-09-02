/* download-files */

import csvIcon from "../../static/images/download-files/csv.png";
import docIcon from "../../static/images/download-files/doc.png";
import docxIcon from "../../static/images/download-files/docx.png";
import xlsIcon from "../../static/images/download-files/xls.png";
import xlsmIcon from "../../static/images/download-files/xlsm.png";
import xlsxIcon from "../../static/images/download-files/xlsx.png";
import xlsxmIcon from "../../static/images/download-files/xlsxm.png";
import zipIcon from "../../static/images/download-files/zip.png";
import importIcon from "../../static/images/download-files/import.png";
import defaultIcon from "../../static/images/download-files/default.png";

/* forms */

import caratIcon from "../../static/images/forms/carat.png";
import filesIcon from "../../static/images/forms/files.png";
import filesListIcon from "../../static/images/forms/filesList.png";
import imageIcon from "../../static/images/forms/image.png";
import model3DIcon from "../../static/images/forms/model3D.png";
import profileIcon from "../../static/images/forms/profile.png";
import slideIcon from "../../static/images/forms/slide.png";
import spreadsheetIcon from "../../static/images/forms/spreadsheet.png";
import spreadsheetUniteIcon from "../../static/images/forms/spreadsheetUnite.png";
import transferFormIcon from "../../static/images/forms/transferForm.png";

/* map */

import acceptIcon from "../../static/images/map/accept.png";
import cancelIcon from "../../static/images/map/cancel.png";
import addBetween from "../../static/images/map/add-between.png";
import handIcon from "../../static/images/map/hand.png";
import movePoint from "../../static/images/map/move-point.png";
import addEnd from "../../static/images/map/add-end.png";
import deletePoint from "../../static/images/map/delete-point.png";
import moveIcon from "../../static/images/map/move.png";
import rotateIcon from "../../static/images/map/rotate.png";

import xIcon from "../../static/images/map/x.png";
import yIcon from "../../static/images/map/y.png";
import scaleIcon from "../../static/images/map/scale.png";

import createPolylineIcon from "../../static/images/map/create-polyline.png";
import createPolygonIcon from "../../static/images/map/create-polygon.png";
import createLabelIcon from "../../static/images/map/create-label.png";
import createSignIcon from "../../static/images/map/create-sign.png";

import selectingIcon from "../../static/images/map/selecting-mode.png";
import creatingIcon from "../../static/images/map/creating-mode.png";


/** Используется в компоненте `DownloadFileItem` (иконки файлов по расширениям). */
export const filesDict: {[key: string]: string} = {
  'csv': csvIcon,
  'doc': docIcon,
  'docx': docxIcon,
  'xls': xlsIcon,
  'xlsx': xlsxIcon,
  'xlsm': xlsmIcon,
  'xlsxm': xlsxmIcon,
  'zip': zipIcon,
  /* --- */
  'import': importIcon,
  'default': defaultIcon,
};

/** Используется в компоненте `Screenshot` (заглушки нереализованных форм). */
export const formIconsDict: {[key: string]: string} = {
  'carat': caratIcon,
  'files': filesIcon,
  'filesList': filesListIcon,
  'image': imageIcon,
  'model3D': model3DIcon,
  'profile': profileIcon,
  'slide': slideIcon,
  'spreadsheet': spreadsheetIcon,
  'spreadsheetUnite': spreadsheetUniteIcon,
  'transferForm': transferFormIcon,
};

/** ### Общие иконки для карт.
 *
 * Используется в компонентах `EditElement` и `MapEditPanel` (редактирование карт). */
export const mapIconsDict: {[key: string]: string} = {
  'x': xIcon,
  'y': yIcon,
  'scale': scaleIcon,
  'accept': acceptIcon,
  'cancel': cancelIcon,
};

/** Иконки режимов редактирования. */
export const mapEditIconsDict: {[key: number]: string} = {
  10:  handIcon,   // MapModes.MOVE_MAP
  11:  moveIcon,   // MapModes.MOVE
  12:  rotateIcon, // MapModes.ROTATE
  21: movePoint,   // MapModes.MOVE_POINT
  22: addEnd,      // MapModes.ADD_END
  23: addBetween,  // MapModes.ADD_BETWEEN
  24: deletePoint, // MapModes.DELETE_POINT
};

/** Иконки создания новых элементов карты. */
export const mapCreatingIcons: {[key: string]: string} = {
  'polyline': createPolylineIcon,
  'polygon': createPolygonIcon,
  'label': createLabelIcon,
  'sign': createSignIcon,
};

/** Иконки некоторых режимов редактирования карты. */
export const mapModesIcons: {[key: string]: string} = {
  'selecting': selectingIcon,
  'creating': creatingIcon,
};
