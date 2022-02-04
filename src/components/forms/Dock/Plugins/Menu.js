import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Toolbar
} from "@progress/kendo-react-buttons";
import setFormLayout from '../../../../store/actionCreators/setFormLayout';
var _ = require("lodash");

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

    const handlePresentationParameters = (plugin) => {
        if (formLayout) {
            var pluginId = plugin.children[0].component.id;
            var pluginExists = formLayout.layout.children.some(ch => ch.children.some(tabch => tabch.component.id === pluginId));
            if (!pluginExists) {
                if (!plugin.initialWeight) {
                    plugin.initialWeight = plugin.weight;
                }
                var totalWeight = _.sum(formLayout.layout.children.map(ch => ch.weight));
                var newWeight = plugin.initialWeight / (100 - plugin.initialWeight) * totalWeight;
                plugin.weight = newWeight;

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
                {plugins.left.map(pl => <Button key={pl.children[0].component.id} className="actionbutton" onClick={() => handlePresentationParameters(pl)}>
                    {pl.children[0].name}
                </Button>)}
            </Toolbar>
        </div>);
}
