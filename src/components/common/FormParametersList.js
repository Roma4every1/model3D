import React from "react";
import { useSelector } from "react-redux";
import {Skeleton} from "@progress/kendo-react-indicators";
import ParametersList from "./ParametersList";


/** Компонент списка параметров формы.
 * @see ParametersList
 * */
export default function FormParametersList(props) {
  const parametersJSON = useSelector((state) => state.formParams[props.formId]);
  return !parametersJSON
    ? <Skeleton shape="rectangle" animation={{type: 'wave'}}/>
    : <ParametersList parametersJSON={parametersJSON} />
}
