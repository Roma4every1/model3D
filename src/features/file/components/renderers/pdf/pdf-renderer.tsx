import './../renderers.scss'

export const PDFRenderer = ({model}: FileRendererProps) => {
  const objectURL = URL.createObjectURL(model.data);
  return (
    <>
      <iframe className={'basicRenderer'} src={objectURL}/>
    </>
  );
};
