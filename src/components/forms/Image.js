import React from 'react';
import Screenshot from './Screenshot';

function Image(props, ref) {
    return Screenshot(props);
}
export default Image = React.forwardRef(Image); // eslint-disable-line