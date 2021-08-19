import Button from '@material-ui/core/Button';
import { Popup } from "@progress/kendo-react-popup";
import { ParametersList } from './ParametersList';
import { globals } from './Globals';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
var utils = require("../utils")

class GlobalParametersList extends Component {

    constructor(props) {
        super(props);
        this.state = { anchorEl: null, open: false, parametersJSON: [] };
    }

    componentDidMount() {
        if (this.props.sessionId) {
            this.loadGlobalProgramsList(this.props.sessionId);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.sessionId !== prevProps.sessionId) {
            this.loadGlobalProgramsList(this.props.sessionId);
        }
    }

    render() {
        const handleClick = (event) => {
            this.setState({ anchorEl: event.currentTarget, open: !this.state.open });
        };

        const updateEditedParametersList = (parametersJSON) => {
            globals.globalParameters = parametersJSON;
            this.setState({ parametersJSON: parametersJSON });
           // setEditedJSON(parametersJSON);
        };

        return (
            <div>
                <Button aria-describedby={this.state.id} variant="contained" color="primary" onClick={handleClick}>
                    {this.props.t('base.parameters')}
                </Button>
                <Popup
                    id={this.state.id}
                    show={this.state.open}
                    popupClass={"popup-content"}
                    anchor={this.state.anchorEl}
                >
                    <ParametersList parametersJSON={this.state.parametersJSON} setMainEditedJSON={updateEditedParametersList} />
                </Popup>
            </div>
        );
    }

    async loadGlobalProgramsList(sessionId) {
        const response = await utils.webFetch(`getGlobalParameters?sessionId=${sessionId}`);
        const responseJSON = await response.json();
        globals.globalParameters = responseJSON;
        this.setState({ parametersJSON: responseJSON });
    }
}

export default withTranslation()(GlobalParametersList);
