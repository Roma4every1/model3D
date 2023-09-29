import { useLayoutEffect, useRef } from 'react';
import { Options, renderAsync } from 'docx-preview';


export const MsWordView = ({content}: FileViewModel<ArrayBuffer>) => {
  const ref = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    const options: Partial<Options> = {ignoreHeight: true, inWrapper: false};
    renderAsync(content, ref.current, ref.current, options).then();
  }, [content]);

  return (
    <div style={{overflowX: 'auto', backgroundColor: '#e1e1e1'}}>
      <div className={'file-view-ms-word'} ref={ref}/>
    </div>
  );
};
