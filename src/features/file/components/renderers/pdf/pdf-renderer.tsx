import './../renderers.scss'

export const PDFRenderer = ({model}: FileRendererProps) => {
  return (
    <>
      <iframe className={'basicRenderer'} src={model.uri}/>
    </>
  );
};
