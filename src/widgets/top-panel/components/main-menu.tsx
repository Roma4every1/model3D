import { PanelsVisibility } from './panels-visibility';
import { ProgramList } from './program-list';
import './main-menu.scss';


export interface MainMenuProps {
  id: ClientID;
  leftLayout: LeftPanelLayout;
}


/** Меню в верхней панели. */
export const MainMenu = ({id, leftLayout}: MainMenuProps) => {
  const style = {display: 'grid', gridTemplateColumns: '250px calc(100% - 250px)'};

  return (
    <div className={'menu'} style={style}>
      <PanelsVisibility leftLayout={leftLayout}/>
      <ProgramList id={id}/>
    </div>
  );
};
