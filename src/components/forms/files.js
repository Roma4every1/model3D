import React from 'react';
import Screenshot from './screenshot';

function Files(props, ref) {
    return Screenshot(props);
}
export default Files = React.forwardRef(Files); // eslint-disable-line
