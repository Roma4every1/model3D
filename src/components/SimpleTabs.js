import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import MenuIcon from '@material-ui/icons/Menu';
import { Toolbar, IconButton } from '@material-ui/core';
import SqlProgramsList from './SqlProgramsList';
import GlobalParametersList from './GlobalParametersList';
import { useTranslation } from 'react-i18next';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function SimpleTabs(props) {
    const { t } = useTranslation();
    const { sessionId, presentationId } = props;
    const [value, setValue] = React.useState(0);
    const [drawerState, setState] = React.useState(false);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState(open);
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(!drawerState)}>
                        <MenuIcon />
                    </IconButton>
                    <GlobalParametersList sessionId={sessionId} />
                    <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                        <Tab label={t('base.programs')} {...a11yProps(0)} />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Drawer anchor='left' open={drawerState} variant='persistent' onClose={toggleDrawer(false)}>
                <div
                    onClick={toggleDrawer(false)}
                >
                    <List onClick={toggleDrawer(false)}>
                        <ListItem button onClick={toggleDrawer(false)}>
                            <ListItemText primary={t('menucommands.savesession')} />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary={t('menucommands.loadsession')} />
                        </ListItem>
                        <Divider />
                        <ListItem button>
                            <ListItemText primary={t('menucommands.about')} />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary={t('menucommands.log')} />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
            <TabPanel value={value} index={0} padding="0">
                <SqlProgramsList
                    sessionId={sessionId}
                    presentationId={presentationId}
                />
            </TabPanel>
        </div>
    );
}