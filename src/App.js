import React, { Component } from 'react';
import { PresentationList } from './components/PresentationList';
import { Presentation } from './components/Presentation';
import { SqlProgramsList } from './components/SqlProgramsList';
import { Box, AppBar, Tabs, Tab, Toolbar, IconButton, Typography, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import SimpleTabs from './components/SimpleTabs';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
//import { TabPanel, TabContext } from '@material-ui/lab';
import MenuIcon from '@material-ui/icons/Menu';
import './custom.css'
var utils = require("./utils")


export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = { imgPath: process.env.PUBLIC_URL + '/images/carat.PNG', presType: 'carat', sessionLoading: true };
    }

    componentDidMount() {
        this.openSession();
    }
    
    a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    TabPanel(props) {
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

    renderLayout() {
        //const [value, setValue] = React.useState(0);
        return (
                <Box>
    {/*                <Toolbar>*/}
    {/*                    <IconButton edge="start" color="inherit" aria-label="menu">*/}
    {/*                        <MenuIcon />*/}
    {/*                    </IconButton>*/}
    {/*                    <Typography variant="h6">*/}
    {/*                        News*/}
    {/*</Typography>*/}
    {/*                    <Button color="inherit">Login</Button>*/}
    {/*                </Toolbar>*/}
                {/*<TabContext>*/}
                <SimpleTabs
                    sessionId={this.state.sessionId}
                    presentationId={this.state.activePresentationId}
                    presType={this.state.presType}
                    selectionChanged={(event) => {
                        this.setState({
                            filterValue: event.target.value
                        })
                    }}
                />
                <Grid container spacing={1}>
                    <Grid item xs={3} spacing={3}>
                        <div class="presentationList">
                            <PresentationList
                                sessionId={this.state.sessionId}
                                selectionChanged={(event, value) => {
                                    const index = value.indexOf('_');
                                    if (index >= 0) {
                                        const substrType = value.slice(index + 1);
                                        const substrId = value.slice(0, index);
                                        this.setState({
                                            presType: substrType,
                                            imgPath: process.env.PUBLIC_URL + '/images/' + substrType + '.PNG',
                                            activePresentationId: substrId
                                        });
                                    }
                                }
                                }
                            />
                        </div>
                    </Grid>
                    <Grid item xs={6} spacing={3}>
                        <Presentation
                            sessionId={this.state.sessionId}
                            presType={this.state.presType}
                            imgPath={this.state.imgPath}
                            filterValue={this.state.filterValue}
                         />
                    </Grid>
                </Grid>
                {/*    <AppBar position="static">*/}
                {/*    <Tabs aria-label="simple tabs example">*/}
                {/*        <IconButton edge="start" color="inherit" aria-label="menu">*/}
                {/*            <MenuIcon />*/}
                {/*        </IconButton>*/}
                {/*            <Tab label="Item One" {...this.a11yProps(0)} />*/}
                {/*        <Tab label="Item Two" {...this.a11yProps(1)} />*/}
                {/*        <Tab label="Item Three" {...this.a11yProps(2)} />*/}
                {/*        </Tabs>*/}
                {/*</AppBar>*/}
                {/*<this.TabPanel value="0" index={0}>Item One</this.TabPanel>*/}
                {/*<this.TabPanel value="1" index={1}>Item Two</this.TabPanel>*/}
                {/*<this.TabPanel value="2" index={2}>Item Three</this.TabPanel>*/}
                {/*    </TabContext>*/}
                {/*<Box>*/}
                {/*    <form noValidate>*/}
                {/*        <TextField*/}
                {/*            id="date"*/}
                {/*            variant="outlined"*/}
                {/*            label="Birthday"*/}
                {/*            type="date"*/}
                {/*            defaultValue="2017-05-24"*/}
                {/*            InputLabelProps={{*/}
                {/*                shrink: true,*/}
                {/*            }}*/}
                {/*        />*/}
                {/*    </form>*/}
                {/*    <form noValidate autoComplete="off">*/}
                {/*        <TextField id="outlined-basic" label="Outlined" variant="outlined" />*/}
                {/*    </form>*/}
                {/*    <form noValidate autoComplete="off">*/}
                {/*        <TextField id="number" label="Number" variant="outlined" type="number" />*/}
                {/*    </form>*/}
                {/*    </Box>*/}
                </Box>
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading session...</em></p>
            : this.renderLayout();

        return (
            <div>
                {contents}
            </div>
        );
    }

    async openSession() {
        //const response = await fetch('http://localhost:81/WellManager.ServerSide.Site/Sessions.svc/web/startSession/get?systemName=DEMO_SYSTEM',
        //    {
        //        method: 'GET',
        //        credentials: 'include'
        //    });
        const response = await utils.webFetch('startSession?systemName=DEMO_SYSTEM');
        const data = await response.text();
        this.setState({
            sessionId: data, sessionLoading: false
        });
    }
}
