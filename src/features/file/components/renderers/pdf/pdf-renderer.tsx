import './pdf-renderer.scss'

export const PDFRenderer = ({model}: FileRendererProps) => {
  const objectURL = URL.createObjectURL(model.data);
  return (
    <>
      <iframe id={'pdfRenderer'} src={objectURL}/>
    </>
  );
};
