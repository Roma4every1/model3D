import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import { ParametersList } from './ParametersList';
import { globalParameters } from './Globals';
import React, { Component } from 'react';
var utils = require("../utils")

export class GlobalParametersList extends Component {

    constructor(props) {
        super(props);
        this.state = { anchorEl: null, open: false, id: undefined, parametersJSON: [] };
    }

    componentDidUpdate(prevProps) {
        if (this.props.sessionId !== prevProps.sessionId) {
            this.loadGlobalProgramsList(this.props.sessionId);
        }
    }

    render() {

        const handleClick = (event) => {
            this.setState({ anchorEl: event.currentTarget, open: true, id: 'simple-popover' });
        };

        const handleClose = () => {
            this.setState({ anchorEl: null, open: false, id: undefined });
        };

        const updateEditedParametersList = (parametersJSON) => {
            globalParameters.globalParameters = parametersJSON;
           // setEditedJSON(parametersJSON);
        };

        return (
            <div>
                <Button aria-describedby={this.state.id} variant="contained" color="primary" onClick={handleClick}>
                    Параметры
                </Button>
                <Popover
                    id={this.state.id}
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <ParametersList parametersJSON={this.state.parametersJSON} setMainEditedJSON={updateEditedParametersList} />
                </Popover>
            </div>
        );
    }

    async loadGlobalProgramsList(sessionId) {
        const response = await utils.webFetch(`getGlobalParameters?sessionId=${sessionId}`);
        const responseJSON = await response.json();
        globalParameters.globalParameters = responseJSON;
        this.setState({ parametersJSON: responseJSON });
    }
}
