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
import drawVertexIcon from "../../static/images/map/draw_vertex.png";
import handIcon from "../../static/images/map/hand.png";
import transformPathIcon from "../../static/images/map/transform_path.png";
import vectorAddIcon from "../../static/images/map/vector_add.png";
import vectorDeleteIcon from "../../static/images/map/vector_delete.png";


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

/** Используется в компоненте `EditWindow` (редактирование карт). */
export const mapIconsDict: {[key: string]: string} = {
  'accept': acceptIcon,
  'cancel': cancelIcon,
  'drawVertex': drawVertexIcon,
  'hand': handIcon,
  'transformPath': transformPathIcon,
  'vectorAdd': vectorAddIcon,
  'vectorDelete': vectorDeleteIcon,
};
