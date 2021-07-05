import React, { Component } from 'react';
import RecursiveTreeView from './RecursiveTreeView';

export class PresentationList extends Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false };
     //   this.state = { presentationsJSON: props.presentationsJSON, loading: props.loading }
    }

    static getDerivedStateFromError(error) {
        // �������� ��������� ���, ����� ��������� ������ ������� �������� ���������.
        return { hasError: true };
    }

    static renderPresentationList(presentationsJSON) {
        return (
                <div>
                { RecursiveTreeView(presentationsJSON)}
                </div>
        );
    }

    render() {
        if (this.state.hasError) {
            // ����� ����� ��������� �������� ���������
            return <h1>���-�� ����� �� ���.</h1>;
        }

        let contents = this.props.loading
            ? <p><em>Loading...</em></p>
            : PresentationList.renderPresentationList(this.props.presentationsJSON);

        return (
            <div>
                <h1 id="tabelLabel" >React WMW</h1>
                {contents}
            </div>
        );
    }
}
