import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";

export default function Statistics(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);
    const sessionManager = useSelector((state) => state.sessionManager);

    const getStat = async () => {
        var cell = formRef.current.activeCell();
        var tableId = formRef.current.tableId();
        var data = await sessionManager.channelsManager.getStatistics(tableId, cell.column);
        var result = data.Values.map(x => x.Key + ': ' + x.Value);
        sessionManager.handleWindowInfo(<div>{result.map(v => <div>{v}</div>)}</div>, null, t('pluginNames.statistics'));
    };

    return (
        <Button className="actionbutton" onClick={getStat}>
            {t('pluginNames.statistics')}
        </Button>);
}