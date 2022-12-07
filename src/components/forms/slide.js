import React from 'react';
import Screenshot from './screenshot';

function Slide(props, ref) {
    return Screenshot(props);
}
export default Slide = React.forwardRef(Slide); // eslint-disable-line
