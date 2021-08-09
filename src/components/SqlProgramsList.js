import { Button, Toolbar } from '@material-ui/core';
import FileSaver from 'file-saver';
import List from '@material-ui/core/List';
import React, { Component } from 'react';
var utils = require("../utils")

export class SqlProgramsList extends Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false, buttonNames: [], loading: true };
    }

    componentDidUpdate(prevProps) {
        if ((this.props.sessionId !== prevProps.sessionId || this.props.presentationId !== prevProps.presentationId) && this.props.presentationId) {
            this.loadSqlProgramsList(this.props.sessionId, this.props.presentationId);
        }
    }

    static getDerivedStateFromError(error) {
        // Обновите состояние так, чтобы следующий рендер показал запасной интерфейс.
        return { hasError: true };
    }

    async runReport(sessionId, reportGuid) {
        const response = await utils.webFetch(`runReport?sessionId=${sessionId}&reportguid=${reportGuid}`);
        const fileName = await response.text();
        const result = await utils.webFetch(`downloadResource?resourceName=${fileName}&sessionId=${sessionId}`);
        const resultText = await result.text();
        const fileExactName = fileName.split('\\').pop().split('/').pop();
        FileSaver.saveAs(
            process.env.PUBLIC_URL + '/' + resultText,
            fileExactName);
        //    utils.webFetch(`removeTempFile?resourceName=${resultText}`);
    }

    static renderProgramButtons(programNames, sessionId, runReportCommand) {
        return (
            <List>
                {programNames.map(programName =>
                        <Button variant="outlined" onClick={() => { runReportCommand(sessionId, programName.id) }}>
                            {programName.displayName}
                        </Button>
                )}
            </List>
        );
    }

    render() {
        if (this.state.hasError) {
            // Здесь можно рендерить запасной интерфейс
            return <h1>Error occured</h1>;
        }

        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : SqlProgramsList.renderProgramButtons(this.state.buttonNames, this.props.sessionId, this.runReport)

        return (
            <div>
                {contents}
            </div>
        );
    }

    async loadSqlProgramsList(sessionId, presentationId) {
        const response = await utils.webFetch(`programsList?sessionId=${sessionId}&presentationId=${presentationId}`);
        const data = await response.json();
        this.setState({ buttonNames: data, loading: false });
    }
}
