import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
import { Label } from "@progress/kendo-react-labels";

export default function FileTextEditor(props) {
    const { t } = useTranslation();
    const value = useSelector((state) => state.formParams[props.formId].find((gp) => gp.id === props.id).value);
    const getInitialValue = value => {
        if (!value) {
            return t("editors.filesNotSelected");
        }
        return decodeURI(value?.split('\\').pop());
    }
    const [valueToShow] = React.useState(getInitialValue(value));
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);

    const openFiles = () => {
        document.getElementById('fileInput' + props.id).click();
    }

    const onBeforeUpload = (event) => {
        const file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = async function () {
            const data = await sessionManager.fetchData(`uploadFile?sessionId=${sessionId}&filename=${file.name}`,
                {
                    method: 'POST',
                    body: reader.result
                });
            var newevent = {};
            newevent.target = {};
            newevent.target.name = props.id;
            newevent.target.value = data;
            props.selectionChanged(newevent);
        }
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className='parametereditor'>
            <input id={'fileInput' + props.id} type="file" onChange={onBeforeUpload} style={{ display: "none" }} />
            <Label style={{ float: "left" }}>{valueToShow}</Label>
            <Button style={{ float: "right" }} onClick={openFiles}>
                <span className='k-icon k-i-folder-open' />
            </Button>
        </div>
    );
}
