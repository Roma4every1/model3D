import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Window, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { Label } from "@progress/kendo-react-labels";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";


export default function SublayerStatisticsWindow({sublayer, header}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [windowSize, setWindowSize] = useState({ width: 300, height: 110 });
  const [statistics, setStatistics] = useState([]);

  const close = () => {
    dispatch(setOpenedWindow('sublayerStatisticsWindow', false, null));
  };

  const translateType = useCallback((type) => {
    switch (type) {
      case 'label': return t('map.labels');
      case 'polyline':return t('map.lines');
      case 'sign': return t('map.points');
      case 'regular2dfield': return t('map.fields');
      case 'pieslice': return t('map.sectors');
      default: return t('map.other');
    }
  }, [t]);

  useEffect(() => {
    let newStatistics = [];
    sublayer.elements.forEach((el) => {
      let typeStat = newStatistics.find(st => st.label === translateType(el.type));
      if (!typeStat) {
        typeStat = { type: el.type, label: translateType(el.type), count: 0 };
        newStatistics.push(typeStat);
      }
      typeStat.count++;
    });
    setStatistics(newStatistics);
    setWindowSize({ width: 300, height: 110 + newStatistics.length * 32 });
  }, [sublayer, translateType]);

  return (
    <Window
      className={'propertiesWindow'}
      title={header} onClose={close}
      width={windowSize.width} height={windowSize.height}
    >
      <div className={'sublayerStatistics'}>
        <Label>{t('map.objectsOnSublayer')}</Label>
        {statistics.map((st) => {
          return (
            <div className={'sublayerStatisticsItem'}>
              <Label>
                {t('map.sublayerStatistics', { type: st.label, count: st.count })}
              </Label>
            </div>
          );
        })}
      </div>
      <DialogActionsBar>
        <Button className={'actionbutton'} onClick={close}>{t('base.ok')}</Button>
      </DialogActionsBar>
    </Window>
  );
}
