import React, { Component } from 'react';
import {RecursiveTreeView} from './RecursiveTreeView';

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
        // �������� ��������� ���, ����� ��������� ������ ������� �������� ���������.
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            // ����� ����� ��������� �������� ���������
            return <h1>Error occured</h1>;
        }

        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : <RecursiveTreeView data={this.state.presentationsJSON} onSelectionChanged={this.props.selectionChanged} />

        return (
            <div>
                <h1 id="tabelLabel" >React WMW</h1>
                {contents}
            </div>
        );
    }

    async loadPresentationList(sessionId) {
        const response = await fetch(`session/presentationList?sessionId=${sessionId}`);
        const data = await response.json();
        const replaceddata = data.replaceAll('@', '');
        const parsedjson = JSON.parse(replaceddata);
        this.setState({
            presentationsJSON: parsedjson, loading: false
        });
    }
}
