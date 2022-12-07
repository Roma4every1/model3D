import React from 'react';
import Screenshot from './screenshot';

function SpreadsheetUnite(props, ref) {
    return Screenshot(props);
}
export default SpreadsheetUnite = React.forwardRef(SpreadsheetUnite); // eslint-disable-line
