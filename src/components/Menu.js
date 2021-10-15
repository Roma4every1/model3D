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

    const loadSessionByDefault = () => {
        sessionManager.loadSessionByDefault();
    }

    let json = require('../../package.json');

    return (
        <Toolbar style={{ padding: 1 }}>
            <Button className="actionbutton" onClick={saveSession}>
                {t('menucommands.savesession')}
            </Button>
            <Button className="actionbutton">
                {t('menucommands.loadsession')}
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
        </Toolbar>);
}
