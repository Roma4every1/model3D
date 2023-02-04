import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { MenuSection, ButtonIcon, BigButtonToggle } from '../common/menu-ui';
import { actions, selectors, sessionManager } from '../../store';
import PACKAGE from '../../../package.json';

import './menu.scss';
import backToSystemsIcon from '../../assets/images/menu/back-to-systems.png';
import aboutProgramIcon from '../../assets/images/menu/about-program.png';
import saveSessionIcon from '../../assets/images/menu/save-session.png';
import defaultSessionIcon from '../../assets/images/menu/default-session.png';
import globalParametersIcon from '../../assets/images/menu/global-parameters.png';
import presentationParametersIcon from '../../assets/images/menu/presentation-parameters.png';
import presentationsListIcon from '../../assets/images/menu/presentations-list.png';


interface AboutProgramWindowProps {
  config: ClientConfiguration,
  onClose: () => void,
}


/** Меню в верхней панели. */
export const MainMenu = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const config = useSelector(selectors.config);
  const leftLayout = useSelector(selectors.leftLayout);

  const [showGlobal, setShowGlobal] = useState(leftLayout.globalParamsHeight > 0);
  const [showForm, setShowForm] = useState(leftLayout.formParamsHeight > 0);
  const [showTree, setShowTree] = useState(leftLayout.treeHeight > 0);

  const togglePanelGlobal = () => {
    dispatch(actions.setLeftTabHeight('globalParamsHeight', showGlobal ? -1 : 1));
    setShowGlobal(!showGlobal);
  };
  const togglePanelForm = () => {
    dispatch(actions.setLeftTabHeight('formParamsHeight', showForm ? -1 : 1));
    setShowForm(!showForm);
  };
  const togglePanelList = () => {
    dispatch(actions.setLeftTabHeight('treeHeight', showTree ? -1 : 1));
    setShowTree(!showTree);
  };

  const closeAboutWindow = () => {
    dispatch(actions.setOpenedWindow('about', false, null));
  };
  const showAboutWindow = () => {
    const window = <AboutProgramWindow key={'about'} config={config} onClose={closeAboutWindow}/>;
    dispatch(actions.setOpenedWindow('about', true, window));
  };

  return (
    <div className={'menu'}>
      <MenuSection header={'Главная'}>
        <Link to={config.root} onClick={sessionManager.stopSession}>
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
      <MenuSection header={'Панели'} className={'map-panel-main'} style={{display: 'flex'}}>
        <BigButtonToggle
          text={'Глобальные параметры'} icon={globalParametersIcon}
          active={showGlobal} action={togglePanelGlobal}
        />
        <BigButtonToggle
          text={'Параметры презентации'} icon={presentationParametersIcon}
          active={showForm} action={togglePanelForm}
        />
        <BigButtonToggle
          text={'Презентации'} icon={presentationsListIcon}
          active={showTree} action={togglePanelList}
        />
      </MenuSection>
    </div>
  );
};

/** Окно "О программе". */
const AboutProgramWindow = ({config, onClose}: AboutProgramWindowProps) => {
  return (
    <Dialog key={'about'} title={'О программе'} onClose={onClose} width={400}>
      <h3>Well Manager React</h3>
      <ul style={{paddingLeft: '12px', margin: 0}}>
        <li>Версия: <b>{PACKAGE['version']}</b></li>
        <li>Сервер: <b>{config.webServicesURL}</b></li>
      </ul>
      <DialogActionsBar>
        <Button onClick={onClose}>Ок</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
