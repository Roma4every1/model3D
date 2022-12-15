import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { MenuSection, ButtonIcon, BigButtonToggle } from "../common/menu-ui";

import { actions, selectors } from "../../store";
import { backToSystemsIcon, aboutProgramIcon, saveSessionIcon, defaultSessionIcon } from "../../dicts/images";
import { globalParametersIcon, presentationParametersIcon, presentationsListIcon } from "../../dicts/images";
import { callBackWithNotices } from "../../utils/notifications";
import PACKAGE from "../../../package.json";
import "../../styles/menu.scss";


interface AboutProgramWindowProps {
  config: ClientConfiguration,
  onClose: () => void,
}


/** Меню в верхней панели. */
export function MainMenu() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const config = useSelector(selectors.config);
  const leftLayout = useSelector(selectors.leftLayout);
  const sessionManager = useSelector(selectors.sessionManager);

  const [showGlobal, setShowGlobal] = useState(leftLayout.globalParamsHeight > 0);
  const [showForm, setShowForm] = useState(leftLayout.formParamsHeight > 0);
  const [showTree, setShowTree] = useState(leftLayout.treeHeight > 0);

  const saveSession = useCallback(() => {
    callBackWithNotices(sessionManager.saveSession(), dispatch, 'Сессия сохранена')
  }, [sessionManager, dispatch]);

  const loadSessionByDefault = useCallback(() => {
    sessionManager.loadSessionByDefault().then();
  }, [sessionManager]);

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

  const closeAboutWindow = useCallback(() => {
    dispatch(actions.setOpenedWindow('about', false, null));
  }, [dispatch]);

  const showAboutWindow = useCallback(() => {
    const window = <AboutProgramWindow config={config} onClose={closeAboutWindow}/>;
    dispatch(actions.setOpenedWindow('about', true, window));
  }, [config, closeAboutWindow, dispatch]);

  return (
    <div className={'menu'}>
      <MenuSection header={'Главная'}>
        <Link to={config.root} onClick={sessionManager.stopSession}>
          <img src={backToSystemsIcon} alt={'back'}/>
          <span>Назад к списку систем</span>
        </Link>
        <ButtonIcon text={'О программе'} icon={aboutProgramIcon} action={showAboutWindow}/>
      </MenuSection>
      <MenuSection header={'Сессия'}>
        <ButtonIcon
          text={t('menucommands.savesession')} icon={saveSessionIcon}
          action={saveSession}
        />
        <ButtonIcon
          text={t('menucommands.loadsessionbydefault')} icon={defaultSessionIcon}
          action={loadSessionByDefault}
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
}

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
}
