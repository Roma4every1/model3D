import { useTranslation } from 'react-i18next';
import { showDialog } from 'entities/window';
import { startSession, saveSession } from 'app/store/session';

import './main-menu.scss';
import { Link } from 'react-router-dom';
import { MenuSection, ButtonIcon } from 'shared/ui';
import { PanelsVisibility } from './panels-visibility';
import { AboutProgramWindow } from 'app/components/about-program';

import backToSystemsIcon from 'assets/menu/back.svg';
import aboutProgramIcon from 'assets/menu/about-program.svg';
import saveSessionIcon from 'assets/menu/save-session.svg';
import defaultSessionIcon from 'assets/menu/default-session.svg';


export interface MainMenuProps {
  location: string;
  leftLayout: LeftPanelLayout;
  config: ClientConfig;
}


/** Меню в верхней панели. */
export const MainMenu = ({location, leftLayout, config}: MainMenuProps) => {
  const { t } = useTranslation();

  const showAboutWindow = () => {
    const props = {title: t('about.dialog-title'), contentStyle: {padding: 0}};
    showDialog('about', props, <AboutProgramWindow config={config} t={t}/>);
  };

  return (
    <div className={'menu'}>
      <MenuSection header={t('menu.main')}>
        <Link to={location}>
          <img src={backToSystemsIcon} alt={'back'}/>
          <span>{t('menu.back')}</span>
        </Link>
        <ButtonIcon text={t('about.dialog-title')} icon={aboutProgramIcon} action={showAboutWindow}/>
      </MenuSection>
      <MenuSection header={t('menu.session')}>
        <ButtonIcon
          text={t('menu.save-session')} icon={saveSessionIcon}
          action={saveSession}
        />
        <ButtonIcon
          text={t('menu.load-default-session')} icon={defaultSessionIcon}
          action={() => startSession(true)}
        />
      </MenuSection>
      <PanelsVisibility leftLayout={leftLayout}/>
    </div>
  );
};
