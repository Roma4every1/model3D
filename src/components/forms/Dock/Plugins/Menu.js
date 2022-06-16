import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button, Toolbar } from "@progress/kendo-react-buttons";
import PanelButtons from "./PanelButtons";
import packageJSON from "../../../../../package.json";


export default function Menu(props) {
  const { t } = useTranslation();
  const sessionManager = useSelector((state) => state.sessionManager);

  const saveSession = () => {sessionManager.saveSession()}
  const loadSessionByDefault = () => {sessionManager.loadSessionByDefault()}

  const versionInfoContent = (
    <div>
      Well Manager React<br />
      {t('version.label')}: <b>{packageJSON['version']}</b>
    </div>
  );
  const handleVersion = () => {
    sessionManager.handleWindowInfo(versionInfoContent, null, t('menucommands.about'));
  }

  return (
    <Toolbar style={{ padding: 1 }}>
      <Button className="actionbutton" onClick={saveSession}>
        {t('menucommands.savesession')}
      </Button>
      <Button className="actionbutton" onClick={loadSessionByDefault}>
        {t('menucommands.loadsessionbydefault')}
      </Button>
      <Button className="actionbutton" onClick={handleVersion}>
        {t('version.label')}
      </Button>
      <Button className="actionbutton">
        {t('menucommands.log')}
      </Button>
      <PanelButtons formId={props.formId} />
    </Toolbar>
  );
}
