import Toolbar from '@material-ui/core/Toolbar';
import React, { Component } from 'react';
import { ProgramParametersList } from './ProgramParametersList';
import { makeStyles } from '@material-ui/core/styles';
var utils = require("../utils")

const useStyles = makeStyles((theme) => ({
    gutters: {
        paddingLeft: theme.spacing(0),
        paddingRight: theme.spacing(0),
        [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
        },
    },
}));

export class SqlProgramsList extends Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false, buttonNames: [], loading: true };
    }

    componentDidMount() {
        this.loadSqlProgramsList(this.props.sessionId, this.props.presentationId);
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
                    <div>
                        <ProgramParametersList sessionId={sessionId} programId={programName.id} programDisplayName={programName.displayName} open="true" />
                    </div>
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
            ? <p><em>Loading...</em></p>
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
