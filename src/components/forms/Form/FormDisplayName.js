import { useSelector } from 'react-redux';
var utils = require("../../../utils");

export default function FormDisplayName(props) {
    const { formData } = props;
    const displayName = useSelector((state) => formData.displayNameString ? utils.getLinkedPropertyValue(formData.displayNameString, formData.id, state) : formData.displayName);

    return (displayName);
}
