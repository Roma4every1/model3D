import React, { Component } from 'react';
import { PresentationList } from './components/PresentationList';
import { SqlProgramsList } from './components/SqlProgramsList';
import './custom.css'

export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = { imgPath: process.env.PUBLIC_URL + '/images/carat.PNG', sessionLoading: true };
    }

    componentDidMount() {
        this.openSession();
    }

    renderLayout() {
        return (
            <div class="container">
                <div class="row">
                    <div class="col-1-4">
                        <div class="presentationList">
                        <PresentationList
                                sessionId={this.state.sessionId}
                                selectionChanged={(event, value) => {
                                    const index = value.indexOf('_');
                                    if (index >= 0) {
                                        const substrType = value.slice(index + 1);
                                        const substrId = value.slice(0, index);
                                        this.setState({
                                            imgPath: process.env.PUBLIC_URL + '/images/' + substrType + '.PNG',
                                            activePresentationId: substrId
                                        });
                                    }
                                }
                                }
                            />
                        </div>
                    </div>
                    <div class="col-3-4">
                        <div>
                            <SqlProgramsList
                                sessionId={this.state.sessionId}
                                presentationId={this.state.activePresentationId}
                            />
                        </div>
                        <img src={this.state.imgPath} alt="logo" />
                    </div>
                </div>
            </div>
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
        const response = await fetch('session/startSession?systemName=DEMO_SYSTEM');
        const data = await response.text();
        this.setState({
            sessionId: data, sessionLoading: false
        });
    }
}
