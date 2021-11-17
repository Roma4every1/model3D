import React from 'react';
import { useSelector } from 'react-redux';
import DownloadFileItem from './DownloadFileItem';

export default function DownloadFiles() {

    const reports = useSelector((state) => Object.values(state.reports));

    return (
        <div>
            {reports.map(r => <DownloadFileItem key={r.Id} operationData={r} />)}
        </div>);
}
