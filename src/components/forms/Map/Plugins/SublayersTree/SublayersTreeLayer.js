import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from "@progress/kendo-react-inputs";

export default function SublayersTreeLayer(props) {
    const { t } = useTranslation();
    const { formRef, subitem } = props;
    const [expanded, setExpanded] = React.useState(false);
    const [checked, setChecked] = React.useState(subitem.sublayer.visible);

    const setExpandedState = () => {
        setExpanded(!expanded);
    };

    const onChecked = () => {
        subitem.sublayer.visible = !checked;
        setChecked(!checked);
        formRef.current.updateCanvas();
    };

    return (
        <div>
            <div className="mapLayerHeader">
                <Checkbox label={subitem.text} value={checked} onChange={onChecked} />
                <div className="mapLayerExpand">
                    <button className="k-button k-button-clear" onClick={setExpandedState}>
                        <span className="k-icon k-i-gear" />
                    </button>
                </div>
            </div>
            {expanded &&
                <div>
                    <div className="mapLayerParam">
                        <div className="mapLayerParamLabel">
                            {t('map.minscale')}
                        </div>
                        <div>
                            {subitem.sublayer.lowscale}
                        </div>
                    </div>
                    <div className="mapLayerParam">
                        <div className="mapLayerParamLabel">
                            {t('map.maxscale')}
                        </div>
                        <div>
                            {subitem.sublayer.highscale}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}