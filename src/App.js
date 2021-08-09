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
        this.state = { imgPath: process.env.PUBLIC_URL + '/images/carat.PNG', presType: 'carat', sessionLoading: true };
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
