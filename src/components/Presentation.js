import React, { Component } from 'react';
import { DataGrid } from '@material-ui/data-grid';
var utils = require("../utils")

export class Presentation extends Component {

    constructor(props) {
        super(props);
        this.state = { imgPath: process.env.PUBLIC_URL + '/images/carat.PNG', presType: 'carat' };
    }

    componentDidUpdate(prevProps) {
        if (this.props.filterValue !== prevProps.filterValue || this.props.sessionId !== prevProps.sessionId) {
            this.loadData(this.props.sessionId, this.props.filterValue);
        }
    }

    render() {
        if (this.props.presType === 'dataSet') {
            return <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={this.state.rowsJSON}
                    columns={this.state.columnsJSON}
                    pageSize={5}
                    checkboxSelection
                    disableSelectionOnClick
                />
            </div>
        }
        else {
            return <img src={this.props.imgPath} alt="logo" />
        }
    }

    async loadData(sessionId, filterValue) {
        var response;
        if (filterValue) {
            response = await utils.webFetch(`fill?sessionId=${sessionId}&filterValue=${filterValue}`);
        }
        else {
            response = await utils.webFetch(`fill?sessionId=${sessionId}`);
        }
        const data = await response.json();

        const columnsJSON = data.Columns.map(function (column) {
            const temp = {};
            temp.field = column.Name;
            temp.headerName = column.Name;
            return temp;
        });
        const rowsJSON = data.Rows.map(function (row, rowIndex) {
            const temp = {};
            temp.id = rowIndex;
            for (var i = 0; i < columnsJSON.length; i++) {
                temp[columnsJSON[i].field] = row.Cells[i];
            }
            return temp;
        });
        this.setState({
            columnsJSON: columnsJSON, rowsJSON: rowsJSON, loading: false
        });
    }
}
