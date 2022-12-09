import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Toolbar } from "@progress/kendo-react-buttons";
import { MenuSection } from "../common/menu-ui";

import { actions, selectors } from "../../store";
import { LeftPanelItems } from "../../layout/left-tabs";
import { menuIconsDict } from "../../dicts/images";
import { callBackWithNotices } from "../../utils/notifications";
import PACKAGE from "../../../package.json";
import "../../styles/menu.scss";


interface AboutProgramWindowProps {
  config: ClientConfiguration,
  onClose: () => void,
}
interface MenuListItemProps {
  text: string,
  icon: string,
  onClick?: () => void
}


/** Меню в верхней панели. */
export function MainMenu() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const config = useSelector(selectors.config);
  const leftLayoutProto = useSelector(selectors.leftLayout);
  const sessionManager = useSelector(selectors.sessionManager);

  const [showGlobal, setShowGlobal] = useState(leftLayoutProto.includes(LeftPanelItems.GLOBAL));
  const [showForm, setShowForm] = useState(leftLayoutProto.includes(LeftPanelItems.FORM));
  const [showList, setShowList] = useState(leftLayoutProto.includes(LeftPanelItems.LIST));

  const saveSession = useCallback(() => {
    callBackWithNotices(sessionManager.saveSession(), dispatch, 'Сессия сохранена')
  }, [sessionManager, dispatch]);

  const loadSessionByDefault = useCallback(() => {
    sessionManager.loadSessionByDefault().then();
  }, [sessionManager]);

  const togglePanelGlobal = () => {
    const newLeftLayoutProto = showGlobal
      ? leftLayoutProto.filter(i => i !== LeftPanelItems.GLOBAL)
      : [...leftLayoutProto, LeftPanelItems.GLOBAL];
    dispatch(actions.setLeftLayout(newLeftLayoutProto));
    setShowGlobal(!showGlobal);
  };

  const togglePanelForm = () => {
    const newLeftLayoutProto = showForm
      ? leftLayoutProto.filter(i => i !== LeftPanelItems.FORM)
      : [...leftLayoutProto, LeftPanelItems.FORM];
    dispatch(actions.setLeftLayout(newLeftLayoutProto));
    setShowForm(!showForm);
  };

  const togglePanelList = () => {
    const newLeftLayoutProto = showList
      ? leftLayoutProto.filter(i => i !== LeftPanelItems.LIST)
      : [...leftLayoutProto, LeftPanelItems.LIST];
    dispatch(actions.setLeftLayout(newLeftLayoutProto));
    setShowList(!showList);
  };

  const closeAboutWindow = useCallback(() => {
    dispatch(actions.setOpenedWindow('about', false, null));
  }, [dispatch]);

  const showAboutWindow = useCallback(() => {
    const window = <AboutProgramWindow config={config} onClose={closeAboutWindow}/>;
    dispatch(actions.setOpenedWindow('about', true, window));
  }, [config, closeAboutWindow, dispatch]);

  return (
    <Toolbar style={{padding: 1}}>
      <div className={'menu'} style={{display: 'flex'}}>
        <MenuSection header={'Главная'}>
          <Link to={config.root} onClick={sessionManager.stopSession}>
            <img src={menuIconsDict['back']} alt={'back'}/>
            <span>Назад к списку систем</span>
          </Link>
          <MenuListItem text={'О программе'} icon={'about'} onClick={showAboutWindow}/>
        </MenuSection>
        <MenuSection header={'Сессия'}>
          <MenuListItem
            text={t('menucommands.savesession')} icon={'save'}
            onClick={saveSession}
          />
          <MenuListItem
            text={t('menucommands.loadsessionbydefault')} icon={'load'}
            onClick={loadSessionByDefault}
          />
        </MenuSection>
        <MenuSection header={'Панели'} className={'map-panel-main'} style={{display: 'flex'}}>
          <PanelToggle
            text={'Глобальные параметры'} icon={LeftPanelItems.GLOBAL}
            active={showGlobal} onClick={togglePanelGlobal}
          />
          <PanelToggle
            text={'Параметры презентации'} icon={LeftPanelItems.FORM}
            active={showForm} onClick={togglePanelForm}
          />
          <PanelToggle
            text={'Презентации'} icon={LeftPanelItems.LIST}
            active={showList} onClick={togglePanelList}
          />
        </MenuSection>
      </div>
    </Toolbar>
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

export const MenuListItem = ({text, icon, onClick}: MenuListItemProps) => {
  return (
    <button onClick={onClick}>
      <img src={menuIconsDict[icon]} alt={icon}/>
      <span>{text}</span>
    </button>
  );
}

const PanelToggle = ({text, icon, active, onClick}: MenuListItemProps & {active: boolean}) => {
  return (
    <button className={'map-action' + (active ? ' selected' : '')} onClick={onClick}>
      <div><img src={menuIconsDict[icon]} alt={icon}/></div>
      <div>{text}</div>
    </button>
  );
};
