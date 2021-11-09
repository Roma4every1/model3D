import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Toolbar
} from "@progress/kendo-react-buttons";

export default function Menu() {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);

    const handleVersion = () => {
        let json = require('../../../../../package.json');
        sessionManager.handleWindowData(t('menucommands.about'),
            <div>{json['name']}<br />{t('version.label')}: {json['version']}</div>,
            'info');
    }

    const saveSession = () => {
        sessionManager.saveSession();
    }

    const loadSessionByDefault = () => {
        sessionManager.loadSessionByDefault();
    }

    return (
        <div>
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
            </Toolbar>
        </div>);
}
