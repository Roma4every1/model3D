import txtFileIcon from 'assets/images/reports/txt.png';
import pngFileIcon from 'assets/images/reports/png.png';
import binFileIcon from 'assets/images/reports/bin.png';
import jpgFileIcon from 'assets/images/reports/jpg.png';
import pdfFileIcon from 'assets/images/reports/pdf.png';
import csvFileIcon from 'assets/images/reports/csv.png';
import docFileIcon from 'assets/images/reports/doc.png';
import docxFileIcon from 'assets/images/reports/docx.png';
import xlsFileIcon from 'assets/images/reports/xls.png';
import xlsmFileIcon from 'assets/images/reports/xlsm.png';
import xlsxFileIcon from 'assets/images/reports/xlsx.png';
import xlsxmFileIcon from 'assets/images/reports/xlsxm.png';
import zipFileIcon from 'assets/images/reports/zip.png';
import defaultFileIcon from 'assets/images/reports/default.png';


/** Словарь иконок для различных расширений файлов. */
export const fileExtensionIconDict: Record<string, string> = {
  'txt': txtFileIcon,
  'png': pngFileIcon,
  'bmp': binFileIcon,
  'jpg': jpgFileIcon,
  'jpeg': jpgFileIcon,
  'pdf': pdfFileIcon,
  'csv': csvFileIcon,
  'doc': docFileIcon,
  'docx': docxFileIcon,
  'xls': xlsFileIcon,
  'xlsx': xlsxFileIcon,
  'xlsm': xlsmFileIcon,
  'xlsxm': xlsxmFileIcon,
  'zip': zipFileIcon,
};

export { defaultFileIcon };
