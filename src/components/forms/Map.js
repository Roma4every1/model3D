import React from 'react';
import Screenshot from './Screenshot';

function Map(props, ref) {
    return Screenshot(props);
}
export default Map = React.forwardRef(Map);