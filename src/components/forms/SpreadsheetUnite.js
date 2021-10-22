import React from 'react';
import Screenshot from './Screenshot';

function SpreadsheetUnite(props, ref) {
    return Screenshot(props);
}
export default SpreadsheetUnite = React.forwardRef(SpreadsheetUnite);
