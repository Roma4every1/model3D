import React from 'react';
import Screenshot from './Screenshot';

function Chart(props, ref) {
    return Screenshot(props);
}
export default Chart = React.forwardRef(Chart);