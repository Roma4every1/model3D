import React from 'react';
import { useSelector } from 'react-redux';
import { toDate } from '../../../../../utils';

export default function DownloadFileItem(props) {

    return (
        <div>
            {props.operationData.Id} ({props.operationData.Progress})
            <br />
            {toDate(props.operationData.Dt).toLocaleString('en-GB')}
        </div>);
}
