import Toolbar from '@material-ui/core/Toolbar';
import React, { Component } from 'react';
import { ProgramParametersList } from './ProgramParametersList';
import { withTranslation } from 'react-i18next';
var utils = require("../utils")

class SqlProgramsList extends Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false, buttonNames: [], loading: true };
    }

    componentDidMount() {
        if (this.props.presentationId) {
            this.loadSqlProgramsList(this.props.sessionId, this.props.presentationId);
        }
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

    static renderProgramButtons(programNames, sessionId) {
        return (
            <Toolbar>
                {programNames.map(programName =>
                    <ProgramParametersList
                        key={programName.id}
                        sessionId={sessionId}
                        programId={programName.id}
                        programDisplayName={programName.displayName}
                        open="true" />
                )}
            </Toolbar>
        );
    }

    render() {
        if (this.state.hasError) {
            // Здесь можно рендерить запасной интерфейс
            return <h1>Error occured</h1>;
        }

        let contents = this.state.loading
            ? <p><em>{this.props.t('base.loading')}</em></p>
            : SqlProgramsList.renderProgramButtons(this.state.buttonNames, this.props.sessionId)

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

export default withTranslation()(SqlProgramsList);