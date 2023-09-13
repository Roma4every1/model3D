import './html-renderer.scss'

export const HTMLRenderer = ({model}: FileRendererProps) => {
  const objectURL = URL.createObjectURL(model.data);
  return (
    <>
      <iframe id={'htmlRenderer'} src={objectURL}></iframe>
    </>
  );
};
