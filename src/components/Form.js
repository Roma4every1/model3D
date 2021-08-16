import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import FormParametersList from './FormParametersList';
import TableForm from './forms/TableForm';

export default function Form(props) {
    const { sessionId, formData, ...other } = props;

    const getImagePath = (formType) => {
        return process.env.PUBLIC_URL + '/images/' + formType + '.PNG';
    }

    var contents = '';
    if (formData.type === 'dataSet') {
        contents =
            <TableForm
                sessionId={sessionId}
                {...other}
            />
    }
    else {
        contents = <div className="imgbox">
            <img src={getImagePath(formData.type)} alt="logo" />
        </div>
    }

    return (
        <Paper variant='outlined'>
            <div className='blockheader'>
                <Toolbar>
                    <FormParametersList sessionId={sessionId} formId={formData.id} />
                    <Typography variant="h6" float='left'>{formData.displayName}</Typography>
                </Toolbar>
            </div>
            {contents}
        </Paper>
    );
}
