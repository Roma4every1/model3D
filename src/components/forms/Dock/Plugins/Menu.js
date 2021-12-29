import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Toolbar
} from "@progress/kendo-react-buttons";
import setFormLayout from '../../../../store/actionCreators/setFormLayout';

export default function Menu(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
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

    const plugins = useSelector((state) => state.layout["plugins"]);
    const formLayout = useSelector((state) => state.layout[formId]);

    const handlePresentationParameters = () => {
        if (formLayout) {
            var plugin = plugins.left.find(p => p.WMWname === 'gridPresentationParameterListSidePanel');
            var settings = {
                global: {
                    rootOrientationVertical: true
                },
                layout: {
                    "type": "row",
                    "children": [...formLayout.layout.children, plugin].sort((a, b) => a.order - b.order)
                }
            }
            dispatch(setFormLayout(formId, settings));
        }
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
                <Button className="actionbutton" onClick={handlePresentationParameters}>
                    {t('base.presentationParameters')}
                </Button>
            </Toolbar>
        </div>);
}
