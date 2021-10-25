import React from 'react';
import Screenshot from './Screenshot';

function FilesList(props, ref) {
    return Screenshot(props);
}
export default FilesList = React.forwardRef(FilesList); // eslint-disable-line
