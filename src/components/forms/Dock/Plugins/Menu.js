import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Toolbar
} from "@progress/kendo-react-buttons";
import PanelButtons from './PanelButtons';

export default function Menu(props) {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formId } = props;

    const handleVersion = () => {
        let json = require('../../../../../package.json');
        sessionManager.handleWindowInfo(<div>{json['name']}<br />{t('version.label')}: {json['version']}</div>, null, t('menucommands.about'));
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
                <PanelButtons formId={formId} />
            </Toolbar>
        </div>);
}
