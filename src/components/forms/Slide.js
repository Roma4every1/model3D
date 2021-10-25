import React from 'react';
import Screenshot from './Screenshot';

function Slide(props, ref) {
    return Screenshot(props);
}
export default Slide = React.forwardRef(Slide); // eslint-disable-line