import './txt-renderer.scss'

export const TXTRenderer = ({model}: FileRendererProps) => {
  const reader = new FileReader();
  reader.readAsText(model.data);
  reader.onload = () => {
    document.getElementById('txtRenderer').innerHTML = reader.result as string;
  };
  return (
    <div id={'txtRenderer'}>

    </div>
  );
};
