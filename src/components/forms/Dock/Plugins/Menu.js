import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
    Button,
    Toolbar
} from "@progress/kendo-react-buttons";

export default function Menu() {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);

    const handleVersion = () => {
        setAboutState(true);
    }

    const [aboutState, setAboutState] = React.useState(false);

    const handleClose = () => {
        setAboutState(false);
    };

    const saveSession = () => {
        sessionManager.saveSession();
    }

    const saveSessionToFile = () => {
        document.getElementById('saveSessionToFileInput').click();
    }

    const loadSessionFromFile = () => {
        document.getElementById('loadSessionFromFileInput').click();
    }

    const loadSessionByDefault = () => {
        sessionManager.loadSessionByDefault();
    }

    let json = require('../../../../../package.json');

    function handleSaveSessionToFile(event) {
        const file = event.target.files[0];
        sessionManager.saveSessionToFile(file);
    }

    function handleLoadSessionFromFile(event) {
        const file = event.target.files[0];
        sessionManager.loadSessionFromFile(file);
    }

    return (
        <div>
            <input id="saveSessionToFileInput" type="file" style={{ display: "none" }} onChange={handleSaveSessionToFile} />
            <input id="loadSessionFromFileInput" type="file" style={{ display: "none" }} onChange={handleLoadSessionFromFile} />
            <Toolbar style={{ padding: 1 }}>
                <Button className="actionbutton" onClick={saveSession}>
                    {t('menucommands.savesession')}
                </Button>
                {/*<Button className="actionbutton" onClick={saveSessionToFile}>*/}
                {/*    {t('menucommands.savesessiontofile')}*/}
                {/*</Button>*/}
                <Button className="actionbutton" onClick={loadSessionFromFile}>
                    {t('menucommands.loadsessionfromfile')}
                </Button>
                <Button className="actionbutton" onClick={loadSessionByDefault}>
                    {t('menucommands.loadsessionbydefault')}
                </Button>
                <Button className="actionbutton" onClick={handleVersion}>
                    {t('version.label')}
                </Button>
                {aboutState && <Dialog title={t('menucommands.about')} onClose={handleClose}>
                    <p
                        style={{
                            margin: "25px",
                            textAlign: "center",
                        }}
                    >
                        {json['name']}<br />{t('version.label') + ': ' + json['version']}
                    </p>
                    <DialogActionsBar>
                        <Button onClick={handleClose}>
                            {t('base.ok')}
                        </Button>
                    </DialogActionsBar>
                </Dialog>}
                <Button className="actionbutton">
                    {t('menucommands.log')}
                </Button>
            </Toolbar>
        </div>);
}
