import React from 'react';
import SqlProgramsList from './components/SqlProgramsList';
import GlobalParametersList from './components/GlobalParametersList';
import PresentationList from './components/PresentationList';
import Presentation from './components/Presentation';
import {
    AppBar,
    AppBarSection,
    Drawer,
    DrawerContent,
    Splitter
} from "@progress/kendo-react-layout";
import SimpleTabs from './components/SimpleTabs';
import '@progress/kendo-theme-default/dist/all.css';
import 'flexlayout-react/style/light.css';
import './custom.css'
import { useTranslation } from 'react-i18next';
import { globals } from './components/Globals';
var utils = require("./utils")

export default function App() {
    const { t } = useTranslation();
    const [activePresentationId, setActivePresentationId] = React.useState();
    const [globalParameters, setGlobalParameters] = React.useState([]);
    const [state, setState] = React.useState({
        sessionLoading: true,
        sessionId: undefined
    });
    const [drawerState, setDrawerState] = React.useState(false);
    const [panes, setPanes] = React.useState([
        {
            size: "300px",
            min: "20px",
            collapsible: true,
        },
        {}
    ]);
    const [navPanes, setNavPanes] = React.useState([
        {
            size: "300px"
        },
        {
        }
    ]);

    const onChange = (event) => {
        setPanes(event.newState);
    };

    const onNavChange = (event) => {
        setNavPanes(event.newState);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setDrawerState(open);
    };

    const items = [
        {
            text: t('menucommands.savesession'),
            icon: "k-i-inbox",
        },
        {
            text: t('menucommands.loadsession'),
            icon: "k-i-calendar",
        },
        {
            separator: true,
        },
        {
            text: t('menucommands.about'),
            icon: "k-i-hyperlink-email",
        },
        {
            text: t('menucommands.log'),
            icon: "k-i-star-outline",
        },
    ];

    React.useEffect(() => {
        let ignore = false;
        async function fetchData() {
            const response = await utils.webFetch('startSession?systemName=DEMO_SYSTEM');
            const data = await response.text();
            globals.sessionId = data;
            if (!ignore) {
                setState({
                    sessionLoading: false,
                    sessionId: data
                });
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, []);

    React.useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => { window.removeEventListener('resize', handleWindowResize) }
    }, []);

    const handleWindowResize = (event) => {
        setNavPanes(event.newState);
    };

    return (
        <div className="app">
            {state.sessionLoading
                ? <p><em>{t('session.loading')}</em></p>
                : <div>
                    <AppBar style={{ height: 30, padding: 1 }}>
                        <AppBarSection>
                            <button className="k-button k-button-clear" onClick={toggleDrawer(!drawerState)}>
                                <span className="k-icon k-i-menu" />
                            </button>
                        </AppBarSection>
                    </AppBar>
                    <div style={{ height: 30 }}>
                        <SqlProgramsList
                            sessionId={state.sessionId}
                            presentationId={activePresentationId}
                        />
                    </div>
                    <Drawer
                        expanded={drawerState}
                        position="start"
                        mode="push"
                        items={items.map((item, index) => ({
                            ...item
                        }))}
                        onSelect={toggleDrawer(false)}
                    >
                        <DrawerContent>
                            <div>
                                <Splitter
                                    panes={panes}
                                    orientation={"horizontal"}
                                    onChange={onChange}
                                >
                                    <Splitter
                                        panes={navPanes}
                                        orientation={"vertical"}
                                        onChange={onNavChange}
                                    >
                                        <div>
                                            <GlobalParametersList sessionId={state.sessionId}
                                                selectionChanged={(target) => {
                                                    setGlobalParameters(target);
                                                }} />
                                        </div>
                                        <div className="presentationList">
                                            <PresentationList
                                                sessionId={state.sessionId}
                                                selectionChanged={(event, value) => {
                                                    setActivePresentationId(value);
                                                }}
                                            />
                                        </div>
                                    </Splitter>
                                    <Presentation class="presentation"
                                        sessionId={state.sessionId}
                                        presentationId={activePresentationId}
                                        globalParameters={globalParameters}
                                        selectionChanged={(target) => {
                                            setGlobalParameters(target);
                                        }}
                                    />
                                </Splitter>
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>
            }
        </div>
    );
}
