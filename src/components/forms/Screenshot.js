import React from "react";
import FormHeader from "./Form/FormHeader";
import { formIconsDict } from "../dicts/images";


export default function Screenshot({formData}) {
  return (
    <div className={'screenshot-container'}>
      <FormHeader formData={formData} />
      <div className={'imgbox'}>
        <img src={formIconsDict[formData.type]} alt={formData.type} />
      </div>
    </div>
  );
}
