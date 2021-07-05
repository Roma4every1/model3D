import React, { Component } from 'react';

export class PresentationList extends Component {
    static displayName = PresentationList.name;

    constructor(props) {
        super(props);
        this.state = { hasError: false };
     //   this.state = { presentationsJSON: props.presentationsJSON, loading: props.loading }
    }

    static getDerivedStateFromError(error) {
        // Обновите состояние так, чтобы следующий рендер показал запасной интерфейс.
        return { hasError: true };
    }

    static renderPresentationList(presentationsJSON) {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>name</th>
                        <th>groupDisplayName</th>
                    </tr>
                </thead>
                <tbody>
                    {presentationsJSON.dockPresentationsManager.client.map(presentation =>
                        <tr>
                            <td>{presentation.name}</td>
                            <td>{presentation.groupDisplayName}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render() {
        if (this.state.hasError) {
            // Здесь можно рендерить запасной интерфейс
            return <h1>Что-то пошло не так.</h1>;
        }

        let contents = this.props.loading
            ? <p><em>Loading...</em></p>
            : PresentationList.renderPresentationList(this.props.presentationsJSON);

        return (
            <div>
                <h1 id="tabelLabel" >React WMW</h1>
                <p>Presentations</p>
                {contents}
            </div>
        );
    }
}
