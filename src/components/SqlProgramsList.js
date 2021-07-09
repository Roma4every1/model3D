import { Button } from '@material-ui/core';
import FileSaver from 'file-saver';
import React, { Component } from 'react';

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
        const response = await fetch(`session/runReport?sessionId=${sessionId}&reportguid=${reportGuid}`);
        const fileName = await response.text();
        const result = await fetch(`session/downloadResource?resourceName=${fileName}&sessionId=${sessionId}`);
        const resultText = await result.text();
        const fileExactName = fileName.split('\\').pop().split('/').pop();
        FileSaver.saveAs(
            process.env.PUBLIC_URL + '/' + resultText,
            fileExactName);
        //    fetch(`session/removeTempFile?resourceName=${resultText}`);
    }

    static renderProgramButtons(programNames, sessionId, runReportCommand) {
        return (
            <div className='table table-striped' aria-labelledby="tabelLabel">
                {programNames.map(programName =>
                    <td>
                        <Button variant="outlined" onClick={() => { runReportCommand(sessionId, programName.id) }}>
                            {programName.displayName}
                        </Button>
                    </td>
                )}
            </div>
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
        const response = await fetch(`session/programsList?sessionId=${sessionId}&presentationId=${presentationId}`);
        const data = await response.json();
        this.setState({ buttonNames: data, loading: false });
    }
}
