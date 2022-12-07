import React from 'react';
import Screenshot from './screenshot';

function Profile(props, ref) {
    return Screenshot(props);
}
export default Profile = React.forwardRef(Profile); // eslint-disable-line
