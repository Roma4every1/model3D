import { useTranslation } from 'react-i18next';
import { useDispatch } from 'shared/lib';
import { showDialog } from 'entities/window';
import { startSession, saveSession } from 'app/store/root-form/root-form.thunks';

import './main-menu.scss';
import { Link } from 'react-router-dom';
import { MenuSection, ButtonIcon } from 'shared/ui';
import { PanelsVisibility } from './panels-visibility';
import { AboutProgramWindow } from 'app/components/about-program.tsx';

import backToSystemsIcon from 'assets/images/menu/back.svg';
import aboutProgramIcon from 'assets/images/menu/about-program.svg';
import saveSessionIcon from 'assets/images/menu/save-session.svg';
import defaultSessionIcon from 'assets/images/menu/default-session.svg';


export interface MainMenuProps {
  leftLayout: LeftPanelLayout;
  config: ClientConfiguration;
}


/** Меню в верхней панели. */
export const MainMenu = ({leftLayout, config}: MainMenuProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const showAboutWindow = () => {
    const props = {title: t('about.dialog-title'), contentStyle: {padding: 0}};
    dispatch(showDialog('about', props, <AboutProgramWindow config={config} t={t}/>));
  };

  return (
    <div className={'menu'}>
      <MenuSection header={t('menu.main')}>
        <Link to={config.root}>
          <img src={backToSystemsIcon} alt={'back'}/>
          <span>{t('menu.back')}</span>
        </Link>
        <ButtonIcon text={t('about.dialog-title')} icon={aboutProgramIcon} action={showAboutWindow}/>
      </MenuSection>
      <MenuSection header={t('menu.session')}>
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
