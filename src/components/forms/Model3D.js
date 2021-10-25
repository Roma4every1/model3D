import React from 'react';
import Screenshot from './Screenshot';

function Model3D(props, ref) {
    return Screenshot(props);
}
export default Model3D = React.forwardRef(Model3D); // eslint-disable-line
