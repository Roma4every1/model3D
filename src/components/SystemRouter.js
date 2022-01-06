import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
var utils = require("../utils");

export default function SystemRouter() {
    const { t } = useTranslation();

    const [systemList, setSystemList] = React.useState([]);

    React.useEffect(() => {
        let ignore = false;

        async function getSystemList() {
            const response = await utils.webFetch(`systemList`);
            const data = await response.json();
            if (!ignore) {
                setSystemList(data.map(systemData => {
                    const attrs = systemData.Attributes.map(attr => [attr.Key, attr.Value]);
                    const obj = Object.fromEntries(attrs);
                    obj.id = systemData.Name;
                    return obj;
                }));
            }
        }
        getSystemList();
        return () => { ignore = true; }
    }, []);

    return (
        <div>
            <nav>
                <h2>{t('session.systemList')}</h2>
                <ul>
                    {systemList.map(system =>
                        <li>
                            <Link to={window.location.pathname + system.id}>{system.displayName ? system.displayName + ' (' + system.id + ')' : system.id}</Link>
                        </li>
                    )}
                </ul>
            </nav>
        </div>
    );
}