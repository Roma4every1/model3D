import React from 'react';
//import ReactDOM from "react-dom";
//import { useSelector } from 'react-redux';
import View3D from "./Model3D/View3D.js";

function Model3D(props, ref) {
    //return Screenshot(props);
    return (
    <div>
      <View3D/>
    </div>
  );
}
export default Model3D = React.forwardRef(Model3D);


