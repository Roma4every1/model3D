import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { DataGrid } from '@material-ui/data-grid';
import { FormParametersList } from './FormParametersList';
var utils = require("../utils")

export class Form extends Component {

    constructor(props) {
        super(props);
        this.state = { rowsJSON: [], columnsJSON: [] };
    }

    componentDidMount() {
        this.loadData(this.props.sessionId, this.props.filterValue);
    }

    componentDidUpdate(prevProps) {
        if (this.props.filterValue !== prevProps.filterValue || this.props.sessionId !== prevProps.sessionId) {
            this.loadData(this.props.sessionId, this.props.filterValue);
        }
    }

    getImagePath(formType) {
        return process.env.PUBLIC_URL + '/images/' + formType + '.PNG';
    }

    render() {
        var contents = '';
        if (this.props.formData.type === 'dataSet') {
            contents = <div style={{ height: 400, width: '100%' }}>
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
            contents = <div className="imgbox">
                <img src={this.getImagePath(this.props.formData.type)} alt="logo" />
            </div>
        }

        return (
            <Paper variant='outlined'>
                <div className='blockheader'>
                    <Toolbar>
                        <FormParametersList sessionId={this.props.sessionId} formId={this.props.formData.id} />
                        <Typography variant="h6" float='left'>{this.props.formData.displayName}</Typography>
                     </Toolbar>
                </div>
                {contents}
            </Paper>
        );
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
