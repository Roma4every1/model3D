import React, { Component } from 'react';

export class SqlProgramsList extends Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false, buttonNames: [], loading: true };
    }

    componentDidUpdate(prevProps) {
        if (this.props.sessionId !== prevProps.sessionId || this.props.presentationId !== prevProps.presentationId) {
            this.loadSqlProgramsList(this.props.sessionId, this.props.presentationId);
        }
    }

    static getDerivedStateFromError(error) {
        // Обновите состояние так, чтобы следующий рендер показал запасной интерфейс.
        return { hasError: true };
    }

    static renderProgramButtons(programNames) {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <tbody>
                    <tr>
                        {programNames.map(programName =>
                            <td>{programName}</td>
                        )}
                    </tr>
                </tbody>
            </table>
        );
    }

    render() {
        if (this.state.hasError) {
            // Здесь можно рендерить запасной интерфейс
            return <h1>Error occured</h1>;
        }

        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : SqlProgramsList.renderProgramButtons(this.state.buttonNames)

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
