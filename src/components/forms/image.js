import React from 'react';
import Screenshot from './screenshot';

function Image(props, ref) {
    return Screenshot(props);
}
export default Image = React.forwardRef(Image); // eslint-disable-line
