import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { MenuSection, ButtonIcon } from 'shared/ui';
import { PanelsVisibility } from './panels-visibility';
import { sessionManager } from '../../../app/store';
import { setOpenedWindow } from 'entities/windows';

import './main-menu.scss';
import PACKAGE from '../../../../package.json';
import backToSystemsIcon from 'assets/images/menu/back-to-systems.png';
import aboutProgramIcon from 'assets/images/menu/about-program.png';
import saveSessionIcon from 'assets/images/menu/save-session.png';
import defaultSessionIcon from 'assets/images/menu/default-session.png';


export interface MainMenuProps {
  leftLayout: LeftPanelLayout;
  config: ClientConfiguration;
}
interface AboutProgramWindowProps {
  config: ClientConfiguration;
  onClose: () => void;
}


/** Меню в верхней панели. */
export const MainMenu = ({leftLayout, config}: MainMenuProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const closeAboutWindow = () => {
    dispatch(setOpenedWindow('about', false, null));
  };
  const showAboutWindow = () => {
    const window = <AboutProgramWindow key={'about'} config={config} onClose={closeAboutWindow}/>;
    dispatch(setOpenedWindow('about', true, window));
  };

  return (
    <div className={'menu'}>
      <MenuSection header={'Главная'}>
        <Link to={config.root}>
          <img src={backToSystemsIcon} alt={'back'}/>
          <span>{t('menu.back')}</span>
        </Link>
        <ButtonIcon text={t('menu.about')} icon={aboutProgramIcon} action={showAboutWindow}/>
      </MenuSection>
      <MenuSection header={'Сессия'}>
        <ButtonIcon
          text={t('menu.save-session')} icon={saveSessionIcon}
          action={sessionManager.saveSession}
        />
        <ButtonIcon
          text={t('menu.load-default-session')} icon={defaultSessionIcon}
          action={sessionManager.loadSessionByDefault}
        />
      </MenuSection>
      <PanelsVisibility leftLayout={leftLayout}/>
    </div>
  );
};

/** Окно "О программе". */
const AboutProgramWindow = ({config, onClose}: AboutProgramWindowProps) => {
  return (
    <Dialog key={'about'} title={'О программе'} onClose={onClose} width={400}>
      <h3>Well Manager <b>{PACKAGE['version']}</b></h3>
      {config.devMode && <div style={{color: 'red'}}>Активен режим разработчика</div>}
      <div>API: <b>{config.webServicesURL}</b></div>
      <DialogActionsBar>
        <Button onClick={onClose}>Ок</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
