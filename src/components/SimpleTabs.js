import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import MenuIcon from '@material-ui/icons/Menu';
import { Toolbar, IconButton, Button } from '@material-ui/core';
import { SqlProgramsList } from './SqlProgramsList';
import TextField from '@material-ui/core/TextField';
import { GlobalParametersList } from './GlobalParametersList';
var utils = require("../utils")

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
        <Box p={3}>
          <Typography>{children}</Typography>
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

const useStyles = makeStyles((theme) => ({
  root: {
    //flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    },
    typography: {
     //   padding: theme.spacing(2),
    },
}));


export default function SimpleTabs(props) {
    const { sessionId, presentationId, presType, selectionChanged } = props;
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const [drawerState, setState] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [editedJSON, setEditedJSON] = React.useState('');
    const [parametersJSON, setParametersJSON] = React.useState('');

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
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(!drawerState)}>
                        <MenuIcon />
                    </IconButton>
                    <GlobalParametersList sessionId={sessionId} />
                    <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                        <Tab label="Параметры старые" {...a11yProps(0)} />
                        <Tab label={presType} {...a11yProps(1)} />
                        <Tab label="Программы" {...a11yProps(2)} />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Drawer anchor='left' open={drawerState} variant='persistent' onClose={toggleDrawer(false)}
                classes={{
                    paper: {
                        width: 240,
                    },
                }}>
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
                <Toolbar disableGutters="true">
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
                    <FormControl variant="outlined" className={classes.formControl}>
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
            <TabPanel value={value} index={1}>
                <Button color="inherit">Login</Button>
                <Button color="inherit">Test</Button>
                <Button>ferrf</Button>
                <Button primary>ferrf</Button>
            </TabPanel>
            <TabPanel value={value} index={2} disableGutters="true" padding="0">
                <SqlProgramsList
                    sessionId={sessionId}
                    presentationId={presentationId}
                />
            </TabPanel>
        </div>
    );
}