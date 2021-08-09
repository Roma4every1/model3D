import React, { Component } from 'react';
import { RecursiveTreeView } from './RecursiveTreeView';
var utils = require("../utils")

export class PresentationList extends Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false, presentationsJSON: [], loading: true};
    }

    componentDidUpdate(prevProps) {
        if (this.props.sessionId !== prevProps.sessionId) {
            this.loadPresentationList(this.props.sessionId);
        }
    }

    static getDerivedStateFromError(error) {
        // Обновите состояние так, чтобы следующий рендер показал запасной интерфейс.
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            // Здесь можно рендерить запасной интерфейс
            return <h1>Error occured</h1>;
        }

        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : <RecursiveTreeView data={this.state.presentationsJSON} onSelectionChanged={this.props.selectionChanged} />

        return (
            <div>
                {contents}
            </div>
        );
    }

    async loadPresentationList(sessionId) {
        const response = await utils.webFetch(`presentationList?sessionId=${sessionId}`);
        const data = await response.text();
        const replaceddata = data.replaceAll('@', '');
        const parsedjson = JSON.parse(replaceddata);
        this.setState({
            presentationsJSON: parsedjson, loading: false
        });
    }
}
