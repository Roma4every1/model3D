import React, { Component } from 'react';

export class FetchData extends Component {
    static displayName = FetchData.name;

    constructor(props) {
        super(props);
        this.state = { forecasts: [], loading: true };
    }

    componentDidMount() {
        this.populateWeatherData();
    }

    static renderForecastsTable(forecasts) {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>name</th>
                        <th>groupDisplayName</th>
                    </tr>
                </thead>
                <tbody>
                    {forecasts.dockPresentationsManager.client.map(forecast =>
                        <tr>
                            <td>{forecast.name}</td>
                            <td>{forecast.groupDisplayName}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : FetchData.renderForecastsTable(this.state.forecasts);

        return (
            <div>
                <h1 id="tabelLabel" >Weather forecast</h1>
                <p>This component demonstrates fetching data from the server.</p>
                {contents}
            </div>
        );
    }

    async populateWeatherData() {
        const response = await fetch('session/presentationList');
        const data = await response.json();
        const replaceddata = data.replaceAll('@', '');
        const parsedjson = JSON.parse(replaceddata);
//        const reportResult = await fetch('report?sessionId=' + data.sessionID);
//        data.sessionXmlDecoded = new TextDecoder().decode(this.convertStringToByteArray(data.sessionXml));
        this.setState({ forecasts: parsedjson, loading: false });
    }

    convertStringToByteArray(str) {
        String.prototype.encodeHex = function () {
            let buffer = new ArrayBuffer(this.length);
            // let view = new Uint32Array(buffer);

            for (var i = 0; i < this.length; ++i) {
                buffer[i] = this.charCodeAt(i);
            }
            return buffer;
        };

        var byteArray = str.encodeHex();
        return byteArray
    }
}
