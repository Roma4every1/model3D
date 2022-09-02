import { mapModesIcons } from "../../../dicts/images";


interface MapPanelHeaderProps {
  text: string,
  button?: {selected: boolean, action: () => void, title: string, icon: string, disabled?: boolean},
}


/** Верхняя часть блока панели редактирования карты. */
export const MapPanelHeader = ({text, button}: MapPanelHeaderProps) => {
  let buttonElement = null;
  if (button) buttonElement = (
    <button
      className={button.selected ? 'active' : undefined}
      disabled={button.disabled} onClick={button.action} title={button.title}
    >
      <img src={mapModesIcons[button.icon]} alt={button.icon}/>
    </button>
  );

  return (
    <div className={'map-panel-header'}>
      {buttonElement}
      <span>{text}</span>
    </div>
  );
};
