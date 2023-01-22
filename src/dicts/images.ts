/* --- Download Files --- */

import csvFileIcon from "../static/images/download-files/csv.png";
import docFileIcon from "../static/images/download-files/doc.png";
import docxFileIcon from "../static/images/download-files/docx.png";
import xlsFileIcon from "../static/images/download-files/xls.png";
import xlsmFileIcon from "../static/images/download-files/xlsm.png";
import xlsxFileIcon from "../static/images/download-files/xlsx.png";
import xlsxmFileIcon from "../static/images/download-files/xlsxm.png";
import zipFileIcon from "../static/images/download-files/zip.png";
import importFileIcon from "../static/images/download-files/import.png";
import defaultFileIcon from "../static/images/download-files/default.png";

/* --- Not Supported Form Icons --- */

// import caratIcon from "../static/images/forms/carat.png";
// import filesIcon from "../static/images/forms/files.png";
// import filesListIcon from "../static/images/forms/filesList.png";
// import imageIcon from "../static/images/forms/image.png";
// import model3DIcon from "../static/images/forms/model3D.png";
// import profileIcon from "../static/images/forms/profile.png";
// import slideIcon from "../static/images/forms/slide.png";
// import spreadsheetIcon from "../static/images/forms/spreadsheet.png";
// import spreadsheetUniteIcon from "../static/images/forms/spreadsheetUnite.png";
// import transferFormIcon from "../static/images/forms/transferForm.png";

/* --- Menu --- */

import backToSystemsIcon from "../static/images/menu/back-to-systems.png";
import aboutProgramIcon from "../static/images/menu/about-program.png";
import saveSessionIcon from "../static/images/menu/save-session.png";
import defaultSessionIcon from "../static/images/menu/default-session.png";

import globalParametersIcon from "../static/images/menu/global-parameters.png";
import presentationParametersIcon from "../static/images/menu/presentation-parameters.png";
import presentationsListIcon from "../static/images/menu/presentations-list.png";

import runProgramIcon from "../static/images/menu/run-program.png";

/* --- DataSet --- */

import tableSelectAllIcon from "../static/images/dataset/select-all.png";
import exportToExcelIcon from "../static/images/dataset/export-to-excel.png";
import statisticsIcon from "../static/images/dataset/statistics.png";
import columnVisibilityIcon from "../static/images/dataset/columns-visibility.png";
import reloadIcon from "../static/images/dataset/reload.png";

/* --- Chart --- */

import chartTooltipIcon from "../static/images/chart/tooltip.png";

/* --- Map --- */

import addBetween from "../static/images/map/add-between.png";
import handIcon from "../static/images/map/hand.png";
import movePoint from "../static/images/map/move-point.png";
import addEnd from "../static/images/map/add-end.png";
import deletePoint from "../static/images/map/delete-point.png";
import moveIcon from "../static/images/map/move.png";
import rotateIcon from "../static/images/map/rotate.png";

import xIcon from "../static/images/map/x.png";
import yIcon from "../static/images/map/y.png";
import scaleIcon from "../static/images/map/scale.png";
import selectAllIcon from "../static/images/map/select-all.png";
import synchronizeIcon from "../static/images/map/synchronize.png";
import pdfIcon from "../static/images/map/pdf.png";
import saveMapIcon from "../static/images/map/save-map.png";

import createPolylineIcon from "../static/images/map/create-polyline.png";
import createLabelIcon from "../static/images/map/create-label.png";
import createSignIcon from "../static/images/map/create-sign.png";

import selectingIcon from "../static/images/map/selecting-mode.png";


export { backToSystemsIcon, aboutProgramIcon, saveSessionIcon, defaultSessionIcon };
export { globalParametersIcon, presentationParametersIcon, presentationsListIcon };
export { runProgramIcon, importFileIcon, defaultFileIcon };

export { tableSelectAllIcon, exportToExcelIcon, statisticsIcon, columnVisibilityIcon, reloadIcon };
export { chartTooltipIcon };

export { xIcon, yIcon, scaleIcon, synchronizeIcon, selectAllIcon };
export { pdfIcon, saveMapIcon };
export { selectingIcon };

/* --- --- --- */

type IconPath = string;
type ImagesDict<Items extends string> = Record<Items, IconPath>;

type FileExtension = 'csv' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'xlsm' | 'xlsxm' | 'zip';

/** Используется в компоненте `DownloadFileItem` (иконки файлов по расширениям). */
export const filesDict: ImagesDict<FileExtension> = {
  'csv': csvFileIcon,
  'doc': docFileIcon,
  'docx': docxFileIcon,
  'xls': xlsFileIcon,
  'xlsx': xlsxFileIcon,
  'xlsm': xlsmFileIcon,
  'xlsxm': xlsxmFileIcon,
  'zip': zipFileIcon,
};

// /** Используется в компоненте `Screenshot` (заглушки нереализованных форм). */
// export const formIconsDict: ImagesDict<string> = {
//   'carat': caratIcon,
//   'files': filesIcon,
//   'filesList': filesListIcon,
//   'image': imageIcon,
//   'model3D': model3DIcon,
//   'profile': profileIcon,
//   'slide': slideIcon,
//   'spreadsheet': spreadsheetIcon,
//   'spreadsheetUnite': spreadsheetUniteIcon,
//   'transferForm': transferFormIcon,
// };

/** Иконки режимов редактирования. */
export const mapEditIconsDict: {[key: number]: IconPath} = {
  10: handIcon,    // MapModes.MOVE_MAP
  11: moveIcon,    // MapModes.MOVE
  12: rotateIcon,  // MapModes.ROTATE
  21: movePoint,   // MapModes.MOVE_POINT
  22: addEnd,      // MapModes.ADD_END
  23: addBetween,  // MapModes.ADD_BETWEEN
  24: deletePoint, // MapModes.DELETE_POINT
};

/** Иконки создания новых элементов карты. */
export const mapCreatingIcons: ImagesDict<'polyline' | 'label' | 'sign'> = {
  'polyline': createPolylineIcon,
  'label': createLabelIcon,
  'sign': createSignIcon,
};
