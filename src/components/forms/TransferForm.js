import React from "react";
import Screenshot from "./Screenshot";


function TransferForm(props, ref) {
  return Screenshot(props);
}
export default TransferForm = React.forwardRef(TransferForm); // eslint-disable-line
