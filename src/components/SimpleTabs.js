import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import MenuIcon from '@material-ui/icons/Menu';
import { Toolbar, IconButton, Button } from '@material-ui/core';
import { SqlProgramsList } from './SqlProgramsList';
import { GlobalParametersList } from './GlobalParametersList';

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
    const { sessionId, presentationId, selectionChanged } = props;
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
                        <Tab label="Тестовые параметры" {...a11yProps(0)} />
                        <Tab label="Программы" {...a11yProps(1)} />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Drawer anchor='left' open={drawerState} variant='persistent' onClose={toggleDrawer(false)}>
                <div
                    onClick={toggleDrawer(false)}
                >
                    <List onClick={toggleDrawer(false)}>
                        <ListItem button onClick={toggleDrawer(false)}>
                            <ListItemText primary='Сохранить сессию' />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary='Загрузить сессию' />
                        </ListItem>
                        <Divider />
                        <ListItem button>
                            <ListItemText primary='О программе' />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary='Лог' />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
            <TabPanel value={value} index={0}>
                <Toolbar>
                    <form noValidate>
                        <TextField
                            id="date"
                            variant="outlined"
                            label="Дата"
                            type="date"
                            defaultValue="2017-05-24"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </form>
                    <form noValidate autoComplete="off">
                        <TextField id="outlined-basic" label="Текст" variant="outlined" />
                    </form>
                    <form noValidate autoComplete="off">
                        <TextField id="number" label="Число" variant="outlined" type="number" onChange={selectionChanged} />
                    </form>
                    <FormControl variant="outlined">
                        <InputLabel id="demo-simple-select-outlined-label">Месторождение</InputLabel>
                        <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            label="Age"
                            value={10}
                        >
                            <MenuItem value="">
                                <em>Нет значения</em>
                            </MenuItem>
                            <MenuItem value={10}>Усинское</MenuItem>
                            <MenuItem value={20}>Возейское</MenuItem>
                            <MenuItem value={30}>Тэдинское</MenuItem>
                        </Select>
                    </FormControl>
                </Toolbar>
            </TabPanel>
            <TabPanel value={value} index={1} padding="0">
                <SqlProgramsList
                    sessionId={sessionId}
                    presentationId={presentationId}
                />
            </TabPanel>
        </div>
    );
}