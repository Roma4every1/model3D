import txtFileIcon from 'assets/reports/file-txt.png';
import pngFileIcon from 'assets/reports/file-png.png';
import binFileIcon from 'assets/reports/file-bin.png';
import jpgFileIcon from 'assets/reports/file-jpg.png';
import pdfFileIcon from 'assets/reports/file-pdf.png';
import csvFileIcon from 'assets/reports/file-csv.png';
import docFileIcon from 'assets/reports/file-doc.png';
import docxFileIcon from 'assets/reports/file-docx.png';
import xlsFileIcon from 'assets/reports/file-xls.png';
import xlsmFileIcon from 'assets/reports/file-xlsm.png';
import xlsxFileIcon from 'assets/reports/file-xlsx.png';
import xlsxmFileIcon from 'assets/reports/file-xlsxm.png';
import zipFileIcon from 'assets/reports/file-zip.png';
import defaultFileIcon from 'assets/reports/file-unknown.png';


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


/** Определяет расширение файла по названию.
 * @example
 * getFileExtension("text.txt") => "txt"
 * getFileExtension("data.xlsx") => "xlsx"
 * */
export function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex !== -1 ? fileName.slice(dotIndex + 1).toLowerCase() : '';
}
