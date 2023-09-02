import { useTranslation } from 'react-i18next';
import { useDispatch } from 'shared/lib';
import { Link } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { DialogActionsBar } from '@progress/kendo-react-dialogs';
import { MenuSection, ButtonIcon } from 'shared/ui';
import { PanelsVisibility } from './panels-visibility';
import { showDialog, closeWindow } from 'entities/window';
import { startSession, saveSession } from 'app/store/root-form/root-form.thunks';

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

  const showAboutWindow = () => {
    const onClose = () => dispatch(closeWindow('about'));
    const content = <AboutProgramWindow config={config} onClose={onClose}/>;
    const props = {title: 'О программе', width: 400, onClose, contentStyle: {padding: 0}};
    dispatch(showDialog('about', props, content));
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
          action={() => dispatch(saveSession())}
        />
        <ButtonIcon
          text={t('menu.load-default-session')} icon={defaultSessionIcon}
          action={() => dispatch(startSession(true))}
        />
      </MenuSection>
      <PanelsVisibility leftLayout={leftLayout}/>
    </div>
  );
};

/** Окно "О программе". */
const AboutProgramWindow = ({config, onClose}: AboutProgramWindowProps) => {
  return (
    <>
      <div style={{padding: '12px 16px'}}>
        <h3>Well Manager <b>{PACKAGE['version']}</b></h3>
        {config.devMode && <div style={{color: 'red'}}>Активен режим разработчика</div>}
        <div>API: <b>{config.webServicesURL}</b></div>
      </div>
      <DialogActionsBar>
        <Button onClick={onClose}>Ок</Button>
      </DialogActionsBar>
    </>
  );
};
