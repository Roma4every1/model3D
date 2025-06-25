import { updateSessionClient } from 'entities/client';
import { BigButtonToggle, MenuSection } from 'shared/ui';
import { ProgramList } from './program-list';

import './main-menu.scss';
import globalParametersIcon from 'assets/common/global-parameters.png';
import presentationParametersIcon from 'assets/common/presentation-parameters.png';
import presentationsListIcon from 'assets/common/presentation-list.png';


export interface MainMenuProps {
  /** ID активной презентации. */
  readonly activeID: ClientID;
  /** Контроллер разметки левой панели. */
  readonly leftLayout: ILeftLayoutController;
}

/** Меню в верхней панели. */
export const MainMenu = (props: MainMenuProps) => {
  const style = {display: 'grid', gridTemplateColumns: '250px calc(100% - 250px)'};

  return (
    <div className={'menu'} style={style}>
      <PanelsVisibility controller={props.leftLayout}/>
      <ProgramList id={props.activeID}/>
    </div>
  );
};

/** Секция, отображающая видимость различных панелей управления. */
const PanelsVisibility = ({controller}: {controller: ILeftLayoutController}) => {
  const toggle = (id: LeftTabID) => {
    if (controller[id].show) {
      controller.hideTab(id);
    } else {
      controller.showTab(id);
    }
    updateSessionClient('root');
  };

  return (
    <MenuSection header={'Панели'} className={'big-buttons'}>
      <BigButtonToggle
        text={'Параметры'} icon={globalParametersIcon}
        active={controller.globalParameters.show}
        onClick={() => toggle('globalParameters')}
      />
      <BigButtonToggle
        text={'Параметры презентации'} icon={presentationParametersIcon}
        active={controller.presentationParameters.show}
        onClick={() => toggle('presentationParameters')}
        disabled={controller.presentationParameters.disabled}
      />
      <BigButtonToggle
        text={'Презентации'} icon={presentationsListIcon}
        active={controller.presentationTree.show}
        onClick={() => toggle('presentationTree')}
      />
    </MenuSection>
  );
};
