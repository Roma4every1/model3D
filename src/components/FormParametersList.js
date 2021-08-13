import Popover from '@material-ui/core/Popover';
import { ParametersList } from './ParametersList';
import { globalParameters } from './Globals';
import React, { Component } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
var utils = require("../utils")

export class FormParametersList extends Component {

    constructor(props) {
        super(props);
        this.state = { anchorEl: null, open: false, id: undefined, parametersJSON: [] };
    }

    componentDidMount() {
        this.loadGlobalProgramsList(this.props.sessionId, this.props.formId);
    }

    componentDidUpdate(prevProps) {
        if (this.props.sessionId !== prevProps.sessionId || this.props.formId !== prevProps.formId) {
            this.loadGlobalProgramsList(this.props.sessionId, this.props.formId);
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
            this.setState({ parametersJSON: parametersJSON });
        };

        return (
            <div>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleClick}>
                    <MenuIcon />
                </IconButton>
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

    async loadGlobalProgramsList(sessionId, formId) {
        const response = await utils.webFetch(`getAllNeedParametersForForm?sessionId=${sessionId}&clientId=${formId}`);
        const responseJSON = await response.json();
        var neededParamsJSON = [];
        globalParameters.globalParameters.forEach(element => {
            responseJSON.forEach(responseParam => {
                if (element.id === responseParam) {
                    neededParamsJSON.push(element);
                }
            });
        });
        this.setState({ parametersJSON: neededParamsJSON });
    }
}
