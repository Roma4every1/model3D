import txtFileIcon from 'assets/files/file-txt.png';
import pngFileIcon from 'assets/files/file-png.png';
import binFileIcon from 'assets/files/file-bin.png';
import jpgFileIcon from 'assets/files/file-jpg.png';
import pdfFileIcon from 'assets/files/file-pdf.png';
import csvFileIcon from 'assets/files/file-csv.png';
import docFileIcon from 'assets/files/file-doc.png';
import docxFileIcon from 'assets/files/file-docx.png';
import xlsFileIcon from 'assets/files/file-xls.png';
import xlsmFileIcon from 'assets/files/file-xlsm.png';
import xlsxFileIcon from 'assets/files/file-xlsx.png';
import xlsxmFileIcon from 'assets/files/file-xlsxm.png';
import zipFileIcon from 'assets/files/file-zip.png';
import defaultFileIcon from 'assets/files/file-unknown.png';


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

/**
 * Определяет расширение файла по названию.
 * @example
 * getFileExtension('text.txt') => 'txt'
 * getFileExtension('data.xlsx') => 'xlsx'
 */
export function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex !== -1 ? fileName.slice(dotIndex + 1).toLowerCase() : '';
}
