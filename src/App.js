import React, { Component } from 'react';
import { PresentationList } from './components/PresentationList';

import './custom.css'

export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = { presentationsJSON: [], presentationsloading: true };
    }

    componentDidMount() {
        this.loadPresentationList();
    }

    render() {
        return (
            <div>
                <PresentationList id='presentations' presentationsJSON={this.state.presentationsJSON} loading={this.state.presentationsloading} />
            </div>
        );
    }

    async loadPresentationList() {
        const response = await fetch('session/presentationList');
        const data = await response.json();
        const replaceddata = data.replaceAll('@', '');
        const parsedjson = JSON.parse(replaceddata);
        this.setState({ presentationsJSON: parsedjson, presentationsloading: false});
    }
}
