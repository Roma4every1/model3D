import React, { Component } from 'react';
import { Form } from './Form';
import { FormsContainer } from './FormsContainer';
var utils = require("../utils")

export class Presentation extends Component {

    constructor(props) {
        super(props);
        this.state = { formsData: [] };
    }

    componentDidUpdate(prevProps) {
        if (this.props.sessionId !== prevProps.sessionId || this.props.presentationId !== prevProps.presentationId) {
            this.loadForms(this.props.sessionId, this.props.presentationId);
        }
    }

    render() {
        return (
            <FormsContainer>
                {this.state.formsData.map(formData =>
                    <Form
                        sessionId={this.props.sessionId}
                        filterValue={this.props.filterValue}
                        formData={formData}
                    />
                )}
            </FormsContainer>);
    }

    async loadForms(sessionId, presentationId) {
        const response = await utils.webFetch(`presentationForms?sessionId=${sessionId}&presentationId=${presentationId}`);
        const data = await response.json();

        this.setState({
            formsData: data
        });
    }
}
