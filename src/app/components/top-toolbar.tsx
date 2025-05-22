import { useTranslation } from 'react-i18next';
import { useAppConfig } from 'shared/global';
import { showDialog } from 'entities/window';
import { startSession, saveSession } from 'app/store/session';
import { Link } from 'react-router';
import { IconRow, IconRowButton, IconRowLink } from 'shared/ui';
import { AboutProgramWindow } from './about-program';

import './top-toolbar.scss';
import backToSystemsIcon from 'assets/common/back.svg';
import saveSessionIcon from 'assets/common/save-session.svg';
import defaultSessionIcon from 'assets/common/default-session.svg';
import devDocIcon from 'assets/common/dev-doc.svg';
import userDocIcon from 'assets/common/user-doc.svg';
import aboutProgramIcon from 'assets/common/about-program.svg';


export const TopRightToolbar = ({title}: {title: string}) => {
  const config = useAppConfig();
  const { t } = useTranslation();

  const showAboutWindow = () => {
    const props = {title: t('about.dialog-title'), contentStyle: {padding: 0}};
    showDialog('about', props, <AboutProgramWindow/>);
  };

  return (
    <div className={'top-right-toolbar'}>
      <div>{title}</div>
      <IconRow>
        <IconRowButton
          icon={saveSessionIcon} alt={'save'}
          title={t('menu.save-session')} onClick={saveSession}
        />
        {config.mode === 'dev' && config.devDocLink && <IconRowLink
          icon={devDocIcon} alt={'dev-doc'}
          href={config.devDocLink} target={'_blank'} title={t('menu.open-dev-doc')}
        />}
        {config.userDocLink && <IconRowLink
          icon={userDocIcon} alt={'manual'}
          href={config.userDocLink} target={'_blank'} title={t('menu.open-manual')}
        />}
        <IconRowButton
          icon={aboutProgramIcon} alt={'about'}
          title={t('about.dialog-title')} onClick={showAboutWindow}
        />
        <IconRowButton
          icon={defaultSessionIcon} alt={'load-default'}
          title={t('menu.load-default-session')} onClick={() => startSession(true)}
        />
      </IconRow>
    </div>
  );
};

export const TopLeftToolbar = ({location}: {location: string}) => {
  const { t } = useTranslation();

  return (
    <IconRow className={'top-left-toolbar'}>
      <Link to={location} title={t('menu.back')}>
        <img src={backToSystemsIcon} alt={'back'}/>
      </Link>
    </IconRow>
  );
};
