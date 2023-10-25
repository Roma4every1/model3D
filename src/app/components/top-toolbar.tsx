import { useDispatch } from 'shared/lib';
import { useTranslation } from 'react-i18next';
import { showDialog } from 'entities/window';
import { saveSession } from 'app/store/root-form/root-form.thunks';
import { IconRow, IconRowButton, IconRowLink } from 'shared/ui';
import { AboutProgramWindow } from './about-program.tsx';

import saveSessionIcon from 'assets/images/menu/save-session.svg';
import devDocIcon from 'assets/images/menu/dev-doc.svg';
import userDocIcon from 'assets/images/menu/user-doc.svg';
import aboutProgramIcon from 'assets/images/menu/about-program.svg';


interface TopToolbarProps {
  config: ClientConfiguration;
}


export const TopToolbar = ({config}: TopToolbarProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const showAboutWindow = () => {
    const props = {title: t('about.dialog-title'), contentStyle: {padding: 0}};
    dispatch(showDialog('about', props, <AboutProgramWindow config={config} t={t}/>));
  };

  return (
    <div style={{position: 'absolute', top: 2, right: 2}}>
      <IconRow gap={2}>
        <IconRowButton
          icon={saveSessionIcon} alt={'save'}
          title={t('menu.save-session')} onClick={() => dispatch(saveSession())}
        />
        {config.devMode && config.devDocLink && <IconRowLink
          icon={devDocIcon} alt={'dev-doc'}
          href={config.devDocLink} target={'_blank'} title={'Открыть документацию для разработчиков'}
        />}
        {config.userDocLink && <IconRowLink
          icon={userDocIcon} alt={'user-doc'}
          href={config.userDocLink} target={'_blank'} title={'Открыть пользовательскую документацию'}
        />}
        <IconRowButton
          icon={aboutProgramIcon} alt={'about'}
          title={t('about.dialog-title')} onClick={showAboutWindow}
        />
      </IconRow>
    </div>
  );
};
