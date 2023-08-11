import {arrayBufferFileLoader, DocRenderer} from '@cyntler/react-doc-viewer';
import {useEffect} from 'react';
import ExcelViewer from 'excel-viewer';

export const ExcelRenderer: DocRenderer = ({
                                             mainState: {currentDocument},
                                           }) => {
  const data = currentDocument.fileData as ArrayBuffer;

  useEffect(() => {
    (async () => {
      if (!data) return;

      new ExcelViewer("#excel-view", data, {
        theme: 'light',
        themeBtn: false,
        lang: 'en'
      });
    })();
  }, [data]);

  return <div id={'excel-view'} />;
};

ExcelRenderer.fileTypes = [
  'xls',
  'xls',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

ExcelRenderer.weight = 10;

ExcelRenderer.fileLoader = arrayBufferFileLoader;
