import React from 'react';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import Form from './components/Form';
import {
    AppBar,
    AppBarSection,
    Drawer,
    DrawerContent
} from "@progress/kendo-react-layout";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
    Button
} from "@progress/kendo-react-buttons";
import '@progress/kendo-theme-default/dist/all.css';
import 'flexlayout-react/style/light.css';
import './custom.css'
import { useTranslation } from 'react-i18next';
import createSessionManager from './components/SessionManager';

export default function App() {
    const { t } = useTranslation();
    const [state, setState] = React.useState({
        sessionLoading: true,
        sessionId: undefined
    });
    const [drawerState, setDrawerState] = React.useState(false);
    const [aboutState, setAboutState] = React.useState(false);

    const handleClose = () => {
        setAboutState(false);
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

    let json = require('../package.json');

    function counterReducer(state = { sessionId: '', globalParams: null, sessionManager: null }, action) {
        switch (action.type) {
            case 'params/set':
                return { sessionId: state.sessionId, globalParams: action.value, sessionManager: state.sessionManager }
            case 'sessionId/set':
                return { sessionId: action.value, globalParams: state.globalParams, sessionManager: state.sessionManager }
            case 'sessionManager/set':
                return { sessionId: state.sessionId, globalParams: state.globalParams, sessionManager: action.value }
            default:
                return state
        }
    }

    var formData = {
        type: "dock",
        opened: true
    }

    const [store, setStore] = React.useState(createStore(counterReducer));

    React.useEffect(() => {
        let ignore = false;
        const sessionManager = createSessionManager('DEMO_SYSTEM', store, (data) => {
            if (!ignore) {
                setState({
                    sessionLoading: false,
                    sessionId: data
                });
            }
        });
        store.dispatch({ type: 'sessionManager/set', value: sessionManager });
        return () => { ignore = true; }
    }, [store]);

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
                                <Form
                                    key="root"
                                    formData={formData}
                                />
                            </DrawerContent>
                        </Drawer>
                    </div>
                }
            </div>
        </Provider>
    );
}
