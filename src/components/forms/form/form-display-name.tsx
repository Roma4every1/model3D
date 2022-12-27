import { useSelector } from "react-redux";
import { getLinkedPropertyValue } from "../../../utils/utils";


export default function FormDisplayName({formData}) {
  return useSelector((state) => {
    return formData.displayNameString
      ? getLinkedPropertyValue(formData.displayNameString, formData.id, state)
      : formData.displayName
  });
}
