import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Toolbar, Button, ButtonGroup } from "@progress/kendo-react-buttons";
import PanelButtons from "./PanelButtons";
import packageJSON from "../../../../../package.json";


const ulStyle = {paddingLeft: '12px', margin: 0};
const preStyle = {fontSize: '1.2rem', marginBottom: 0, marginTop: '2px'};

const ConfigView = ({config}) => {
  return (
    <ul style={ulStyle}>
      <li>
        <b title={'Ссылка на службу запросов WMW.'}>webServicesURL:</b><br/>
        <pre style={preStyle}>'{config.webServicesURL}'</pre>
      </li>
      <li>
        <b title={'Относительный путь до домашней страницы.'}>root:</b><br/>
        <pre style={preStyle}>'{config.root}'</pre>
      </li>
    </ul>
  );
}
const VersionInfo = ({text}) => {
  return (
    <div>
      Well Manager React<br/>
      {text}: <b>{packageJSON['version']}</b>
    </div>
  );
}

export default function Menu(props) {
  const { t } = useTranslation();

  const config = useSelector((state) => state.appState.config.data);
  const sessionManager = useSelector((state) => state.sessionManager);

  const saveSession = () => {sessionManager.saveSession()}
  const loadSessionByDefault = () => {sessionManager.loadSessionByDefault()}

  const handleVersion = () => {
    sessionManager.handleWindowInfo(<VersionInfo text={t('version.label')}/>, null, t('menucommands.about'));
  };
  const handleConfig = () => {
    sessionManager.handleWindowInfo(<ConfigView config={config}/>, null, 'Клиентская конфигурация');
  };

  return (
    <Toolbar style={{padding: '4px'}}>
      <ButtonGroup>
        <Button className={'actionbutton'} onClick={saveSession}>
          {t('menucommands.savesession')}
        </Button>
        <Button className={'actionbutton'} onClick={loadSessionByDefault}>
          {t('menucommands.loadsessionbydefault')}
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button className={'actionbutton'} onClick={handleVersion}>
          {t('version.label')}
        </Button>
        <Button className={'actionbutton'} onClick={handleConfig}>
          Конфигурация
        </Button>
        <Button className={'actionbutton'}>
          {t('menucommands.log')}
        </Button>
      </ButtonGroup>
      <PanelButtons formId={props.formId} />
    </Toolbar>
  );
}
