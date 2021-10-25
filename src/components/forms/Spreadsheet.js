import React from 'react';
import Screenshot from './Screenshot';

function Spreadsheet(props, ref) {
    return Screenshot(props);
}
export default Spreadsheet = React.forwardRef(Spreadsheet); // eslint-disable-line