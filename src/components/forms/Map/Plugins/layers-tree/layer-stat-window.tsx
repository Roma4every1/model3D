import { useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { TFunction, useTranslation } from "react-i18next";
import { Window, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { actions } from "../../../../../store";


interface LayerStatWindowProps {
  header: string,
  layer: MapLayer,
}
interface LayerStatItem {
  type: string,
  label: string,
  count: number,
}
type LayerStat = LayerStatItem[];


const windowName = 'layerStatWindow';

const translationDict: Record<string, string> = {
  'label': 'map.labels',
  'polyline': 'map.lines',
  'sign': 'map.points',
  'regular2dfield': 'map.fields',
  'pieslice': 'map.sectors',
};

const getLayersStat = (layer: MapLayer, t: TFunction): LayerStat => {
  const stat: LayerStat = [];
  layer.elements.forEach((el) => {
    let typeStat = stat.find(st => st.type === el.type);
    if (!typeStat) {
      const label = t(translationDict[el.type] || 'map.others');
      typeStat = { type: el.type, label, count: 0 };
      stat.push(typeStat);
    }
    typeStat.count++;
  });
  return stat;
};

const mapStat = (item: LayerStatItem) => {
  return <li key={item.label}>{item.label} - {item.count}</li>;
};


/** Окно со статистикой слоя карты. */
export const LayerStatisticsWindow = ({header, layer}: LayerStatWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const stat = useMemo(() => {
    return getLayersStat(layer, t)
  }, [layer, t]);

  const onClose = useCallback(() => {
    dispatch(actions.setOpenedWindow(windowName, false, null));
  }, [dispatch]);

  return (
    <Window
      className={'propertiesWindow'} title={header} resizable={false}
      width={300} height={103 + stat.length * 32} onClose={onClose}
    >
      <div>
        <span>{t('map.layer-stat-header')}</span>
        <ul>{stat.map(mapStat)}</ul>
      </div>
      <DialogActionsBar>
        <Button className={'actionbutton'} onClick={onClose}>{t('base.ok')}</Button>
      </DialogActionsBar>
    </Window>
  );
}
