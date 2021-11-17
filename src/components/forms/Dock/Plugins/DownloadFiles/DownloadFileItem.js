import React from 'react';
import { toDate } from '../../../../../utils';

export default function DownloadFileItem(props) {
    const { operationData } = props;

    return (<div key={operationData.Id}>
        {operationData.Id} ({props.operationData.Progress})
        <br />
        {toDate(props.operationData.Dt).toLocaleDateString()}
    </div>);
}
