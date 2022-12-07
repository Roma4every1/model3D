import React from 'react';
import Screenshot from './Screenshot';

function Files(props, ref) {
    return Screenshot(props);
}
export default Files = React.forwardRef(Files); // eslint-disable-line
