import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import SystemRoot from './SystemRoot';
var utils = require("../utils");

export default function SystemRouter() {
    const { t } = useTranslation();

    const [systemList, setSystemList] = React.useState([]);
    const [systemName, setSystemName] = React.useState(null);
    let [searchParams] = useSearchParams();

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
        let localSystemName = searchParams.get("systemName");
        setSystemName(localSystemName);
        if (!localSystemName) {
            getSystemList();
        }
        return () => { ignore = true; }
    }, [searchParams]);

    return (
        <div>
            {systemName ?
                <SystemRoot systemName={systemName} />
                :
                <nav>
                    <h2>{t('session.systemList')}</h2>
                    <ul>
                        {systemList.map(system =>
                            <li key={system.id}>
                                <Link to={'?systemName=' + system.id}>{system.displayName ? system.displayName + ' (' + system.id + ')' : system.id}</Link>
                            </li>
                        )}
                    </ul>
                </nav>
            }
        </div>
    );
}