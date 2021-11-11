import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
import { Label } from "@progress/kendo-react-labels";

export default function FilesTextEditor(props) {
    const { t } = useTranslation();
    const getInitialValue = value => {
        if (!value) {
            return t("editors.filesNotSelected");
        }
        return t("editors.filesCount", { count: value?.split('|').length });
    }
    const [valueToShow, setValueToShow] = React.useState(getInitialValue(props.value));
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);

    const openFiles = () => {
        document.getElementById('fileInput' + props.id).click();
    }

    const onBeforeUpload = async (event) => {
        var fileNames = await Promise.all([...event.target.files].map(file => {
            return new Promise((resolve) => {
                let reader = new FileReader();
                reader.onload = async function () {
                    const data = await sessionManager.fetchData(`uploadFile?sessionId=${sessionId}&filename=${file.name}`,
                        {
                            method: 'POST',
                            body: reader.result
                        });
                    resolve(data);
                }
                reader.readAsArrayBuffer(file);
            });
        }));
        var newevent = {};
        newevent.target = {};
        newevent.target.name = props.id;
        newevent.target.value = fileNames.join('|');
        props.selectionChanged(newevent);
    };

    return (
        <div className='parametereditor'>
            <input id={'fileInput' + props.id} type="file" multiple onChange={onBeforeUpload} style={{ display: "none" }} />
            <Label style={{ float: "left" }}>{valueToShow}</Label>
            <Button style={{ float: "right" }} onClick={openFiles}>
                <span className='k-icon k-i-folder-open' />
            </Button>
        </div>
    );
}
