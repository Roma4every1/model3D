import React from 'react';
import SqlProgramsList from './SqlProgramsList';
import GlobalParametersList from './GlobalParametersList';
import {
    AppBar,
    AppBarSection,
    Drawer,
    DrawerContent
} from "@progress/kendo-react-layout";
import { useTranslation } from 'react-i18next';

export default function SimpleTabs(props) {
    const { t } = useTranslation();
    const { sessionId, presentationId, ...other } = props;
    const [drawerState, setState] = React.useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState(open);
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

    return (
        <div>
            <AppBar>
                <AppBarSection>
                    <button className="k-button k-button-clear" onClick={toggleDrawer(!drawerState)}>
                        <span className="k-icon k-i-menu" />
                    </button>
                </AppBarSection>
                <AppBarSection>
                    <GlobalParametersList sessionId={sessionId} {...other} />
                </AppBarSection>
            </AppBar>
            {/*<TabStrip selected={selected} onSelect={handleSelect}>*/}
            {/*    <TabStripTab title={t('base.programs')}>*/}
            <SqlProgramsList
                sessionId={sessionId}
                presentationId={presentationId}
            />
            {/*    </TabStripTab>*/}
            {/*</TabStrip>*/}
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
                    <button className="k-button">
                        Toggle the drawer state
                    </button>
                </DrawerContent>
            </Drawer>
        </div>
    );
}