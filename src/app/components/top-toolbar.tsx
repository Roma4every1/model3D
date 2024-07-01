import { useTranslation } from 'react-i18next';
import { showDialog } from 'entities/window';
import { saveSession } from 'app/store/session';
import { IconRow, IconRowButton, IconRowLink } from 'shared/ui';
import { AboutProgramWindow } from './about-program';

import saveSessionIcon from 'assets/menu/save-session.svg';
import devDocIcon from 'assets/menu/dev-doc.svg';
import userDocIcon from 'assets/menu/user-doc.svg';
import aboutProgramIcon from 'assets/menu/about-program.svg';


interface TopToolbarProps {
  config: ClientConfig;
}


export const TopToolbar = ({config}: TopToolbarProps) => {
  const { t } = useTranslation();

  const showAboutWindow = () => {
    const props = {title: t('about.dialog-title'), contentStyle: {padding: 0}};
    showDialog('about', props, <AboutProgramWindow config={config} t={t}/>);
  };

  return (
    <div style={{position: 'absolute', top: 2, right: 2}}>
      <IconRow gap={2}>
        <IconRowButton
          icon={saveSessionIcon} alt={'save'}
          title={t('menu.save-session')} onClick={saveSession}
        />
        {config.devMode && config.devDocLink && <IconRowLink
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
      </IconRow>
    </div>
  );
};
