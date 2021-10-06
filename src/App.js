import React from 'react';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import SqlProgramsList from './components/SqlProgramsList';
import GlobalParametersList from './components/GlobalParametersList';
import PresentationList from './components/PresentationList';
import PresentationParametersList from './components/PresentationParametersList';
import Presentation from './components/Presentation';
import {
    AppBar,
    AppBarSection,
    Drawer,
    DrawerContent,
    Splitter
} from "@progress/kendo-react-layout";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
    Button
} from "@progress/kendo-react-buttons";
import '@progress/kendo-theme-default/dist/all.css';
import 'flexlayout-react/style/light.css';
import './custom.css'
import { useTranslation } from 'react-i18next';
import { globals } from './components/Globals';
var utils = require("./utils")

export default function App() {
    const { t } = useTranslation();
    const [activePresentationId, setActivePresentationId] = React.useState();
    const [changedParameter, setChangedParameter] = React.useState([]);
    const [modifiedTables, setModifiedTables] = React.useState([]);
    const [state, setState] = React.useState({
        sessionLoading: true,
        sessionId: undefined
    });
    const [drawerState, setDrawerState] = React.useState(false);
    const [aboutState, setAboutState] = React.useState(false);
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

    const handleClose = () => {
        setAboutState(false);
    };

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
        if (event.itemIndex) {
            if (event.itemIndex === 3) {
                setAboutState(true);
            }
        }
        else {
            setDrawerState(open);
        }
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
    let json = require('../package.json');

    function counterReducer(state = { value: 0 }, action) {
        switch (action.type) {
            case 'counter/incremented':
                return { value: state.value + 1 }
            case 'counter/decremented':
                return { value: state.value - 1 }
            default:
                return state
        }
    }

    let store = createStore(counterReducer)

    return (
        <Provider store={store}>
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
                                    <div style={{ height: 30 }}>
                                        <SqlProgramsList
                                            sessionId={state.sessionId}
                                            presentationId={activePresentationId}
                                            tablesModified={(target) => {
                                                setModifiedTables(target);
                                            }}
                                        />
                                    </div>
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
                                                        setChangedParameter(target);
                                                    }} />
                                            </div>
                                            <div>
                                                <PresentationParametersList
                                                    sessionId={state.sessionId}
                                                    presentationId={activePresentationId}
                                                    selectionChanged={(target) => {
                                                        setChangedParameter(target);
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
                                        <Presentation
                                            sessionId={state.sessionId}
                                            presentationId={activePresentationId}
                                            changedParameter={changedParameter}
                                            selectionChanged={(target) => {
                                                setChangedParameter(target);
                                            }}
                                            modifiedTables={modifiedTables}
                                        />
                                    </Splitter>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                }
            </div>
        </Provider>
    );
}
