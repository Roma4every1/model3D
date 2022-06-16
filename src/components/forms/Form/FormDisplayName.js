import {useSelector} from "react-redux";
import {getLinkedPropertyValue} from "../../../utils";


export default function FormDisplayName(props) {
  const { formData } = props;
  return useSelector((state) => {
    return formData.displayNameString
      ? getLinkedPropertyValue(formData.displayNameString, formData.id, state)
      : formData.displayName
  });
}
