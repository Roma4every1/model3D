import './../renderers.scss'

export const HTMLRenderer = ({model}: FileRendererProps) => {
  const objectURL = URL.createObjectURL(model.data);
  return (
    <>
      <iframe className={'basicRenderer'} src={objectURL}></iframe>
    </>
  );
};
