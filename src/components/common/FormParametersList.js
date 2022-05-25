import React from "react";
import { useSelector } from "react-redux";
import { Loader } from "@progress/kendo-react-indicators";
import ParametersList from "./ParametersList";


/** Компонент списка параметров формы.
 * @see ParametersList
 * */
export default function FormParametersList(props) {
  const parametersJSON = useSelector((state) => state.formParams[props.formId]);
  return (
    <div>
      {!parametersJSON
        ? <Loader size="small" type="infinite-spinner" />
        : <ParametersList parametersJSON={parametersJSON} />}
    </div>
  );
}
