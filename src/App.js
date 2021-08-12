import React, { Component } from 'react';
import { PresentationList } from './components/PresentationList';
import { Presentation } from './components/Presentation';
import { Box } from '@material-ui/core';
import SimpleTabs from './components/SimpleTabs';
import Grid from '@material-ui/core/Grid';
import './custom.css'
var utils = require("./utils")


export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = { sessionLoading: true };
    }

    componentDidMount() {
        this.openSession();
    }
    
    renderLayout() {
        return (
            <Box>
                <SimpleTabs
                    sessionId={this.state.sessionId}
                    presentationId={this.state.activePresentationId}
                    selectionChanged={(event) => {
                        this.setState({
                            filterValue: event.target.value
                        })
                    }} />
                <Grid container spacing={1}>
                    <Grid container item xs={12} spacing={3}>
                        <Grid item xs={3}>
                            <div className="presentationList">
                                <PresentationList
                                sessionId={this.state.sessionId}
                                selectionChanged={(event, value) => {
                                    this.setState({
                                        activePresentationId: value
                                    });
                                }}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={9}>
                            <Presentation class="presentation"
                                sessionId={this.state.sessionId}
                                presentationId={this.state.activePresentationId}
                                filterValue={this.state.filterValue}
                                />
                        </Grid>
                    </Grid>
                </Grid>
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
        const response = await utils.webFetch('startSession?systemName=DEMO_SYSTEM');
        const data = await response.text();
        this.setState({
            sessionId: data, sessionLoading: false
        });
    }
}
