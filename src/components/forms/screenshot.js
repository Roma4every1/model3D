import React from "react";
import { formIconsDict } from "../../dicts/images";


export default function Screenshot({formData}) {
  return (
    <div className={'screenshot-container imgbox'}>
      <img src={formIconsDict[formData.type]} alt={formData.type} />
    </div>
  );
}
