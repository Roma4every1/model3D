import React from 'react';
import { useSelector } from 'react-redux';
import DownloadFileItem from './DownloadFileItem';

export default function DownloadFiles() {

    const reports = useSelector((state) => state.reports);

    return (
        <div>
            {Object.values(reports).map(r => <DownloadFileItem operationData={r} />)}
        </div>);
}
