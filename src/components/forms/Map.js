import React from 'react';
import App from './Map/App';

function Map(props, ref) {
    return <App/>;
}
export default Map = React.forwardRef(Map); // eslint-disable-line