import {arrayBufferFileLoader, DocRenderer} from "@cyntler/react-doc-viewer";
import {useEffect, useState} from "react";

export const SVGRenderer: DocRenderer = ({
                                             mainState: {currentDocument},
                                           }) => {
  const data = currentDocument.fileData as ArrayBuffer;

  const [__html, setHTML] = useState("");
  useEffect(() => {
    (async () => {
      if (!currentDocument) return;
      if (!data) return;

      setHTML("svg");
    })();
  }, [currentDocument, data]);

  return (<div dangerouslySetInnerHTML={{__html}}/>);
};

SVGRenderer.fileTypes = [
  'svg',
  'image/svg+xml'
];

SVGRenderer.weight = 10;

SVGRenderer.fileLoader = arrayBufferFileLoader;
