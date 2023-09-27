import {useEffect} from "react";
import * as docx from "docx-preview";

export const MsWordRenderer = ({model}: FileRendererProps) => {
  const data = model.data;

  useEffect(
    () => {
      const docElement = document.getElementById('msDocRenderer');
      data.arrayBuffer().then((res) =>{
        docx.renderAsync(
          res,
          docElement,
          docElement,
          {
            ignoreHeight: true,
            inWrapper: false,
          })
      })
        .then(() => {});
    }, [data]);

  return (
    <div className={'msDocRendererContainer'}>
      <div id='msDocRenderer'/>
    </div>
  );
};
