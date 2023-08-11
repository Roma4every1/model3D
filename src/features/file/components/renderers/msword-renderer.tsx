import {arrayBufferFileLoader, DocRenderer} from "@cyntler/react-doc-viewer";
import {useEffect} from "react";
import * as docx from "docx-preview";

export const MSWordRenderer: DocRenderer = ({
                                             mainState: {currentDocument},
                                           }) => {
  const data = currentDocument.fileData as ArrayBuffer;

  useEffect(
    () => {
      const docElement = document.getElementById('msdoccontainer');
      docx
        .renderAsync(
          data,
          docElement,
          docElement,
          {
            ignoreHeight: true,
            inWrapper: false
          })
        .then(() => {});
    }, [data]);

  return (<div id='msdoccontainer'/>);
};

MSWordRenderer.fileTypes = [
  'docx',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

MSWordRenderer.weight = 10;

MSWordRenderer.fileLoader = arrayBufferFileLoader;
