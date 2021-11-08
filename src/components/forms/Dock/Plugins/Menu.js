import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Toolbar
} from "@progress/kendo-react-buttons";
import setWindowData from "../../../../store/actionCreators/setWindowData";

export default function Menu() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sessionManager = useSelector((state) => state.sessionManager);

    const handleVersion = () => {
        let json = require('../../../../../package.json');
        dispatch(setWindowData(<div>{json['name']}<br />{t('version.label')}: {json['version']}</div>, 'info'));
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
