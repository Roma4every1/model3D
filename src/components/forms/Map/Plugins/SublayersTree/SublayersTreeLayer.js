import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { Popup } from "@progress/kendo-react-popup";
import { Menu, MenuItem } from "@progress/kendo-react-layout";
import SublayerStatisticsWindow from "./SublayerStatisticsWindow";
import { actions } from "../../../../../store";


export default function SublayersTreeLayer({subitem, formId}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  /** @type MapState.utils.updateCanvas */
  const updateCanvas = useSelector(state => state.maps[formId]?.utils?.updateCanvas);
  const activeLayer = useSelector(state => state.maps[formId]?.activeLayer);

  const [selected, setSelected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState(subitem.sublayer.visible);
  const [lowScale, setLowScale] = useState(subitem.sublayer.lowscale);
  const [highScale, setHighScale] = useState(subitem.sublayer.highscale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [offset, setOffset] = useState({ left: 0, top: 0 });

  const menuWrapperRef = useRef(null);
  const _lowScaleRef = useRef(null);
  const _highScaleRef = useRef(null);

  useEffect(() => {
    setSelected(subitem.sublayer === activeLayer);
  }, [activeLayer, subitem]);

  useEffect(() => {
    if (!subitem.sublayer.initialLowscale) {
      subitem.sublayer.initialLowscale = subitem.sublayer.lowscale;
      subitem.sublayer.initialHighscale = subitem.sublayer.highscale;
    }
  }, [subitem]);

  const setExpandedState = () => {setExpanded(!expanded)};
  const setInfinity = () => {setHighScale('INF')};
  const onPopupOpen = () => {menuWrapperRef.current.querySelector("[tabindex]").focus()};

  const onChecked = () => {
    subitem.sublayer.visible = !checked;
    setChecked(!checked);
    if (!subitem.sublayer.visible && selected) {
      dispatch(actions.setActiveLayer(formId, null));
      setSelected(false);
    }
    updateCanvas();
  };

  const applyScales = () => {
    subitem.sublayer.lowscale = lowScale;
    subitem.sublayer.highscale = highScale;
    updateCanvas();
  };

  const revertScales = () => {
    if (!subitem.sublayer.initialLowscale || !updateCanvas) return;

    setLowScale(subitem.sublayer.initialLowscale);
    setHighScale(subitem.sublayer.initialHighscale);
    subitem.sublayer.lowscale = subitem.sublayer.initialLowscale;
    subitem.sublayer.highscale = subitem.sublayer.initialHighscale;
    updateCanvas();
  };

  const setSelectedState = (e) => {
    if (e.nativeEvent.target.localName !== 'div') return;
    if (selected) {
      dispatch(actions.setActiveLayer(formId, null));
    } else {
      dispatch(actions.setActiveLayer(formId, subitem.sublayer));
      if (!checked) onChecked();
    }
    setSelected(!selected);
  };

  const handleOnMenuSelect = (e) => {
    switch (e.item.text) {
      case t('base.statistics'):
        dispatch(actions.setOpenedWindow('sublayerStatisticsWindow', true,
          <SublayerStatisticsWindow
            key={'sublayerStatisticsWindow'}
            sublayer={subitem.sublayer}
            header={subitem.text}
          />));
        break;
      default: {}
    }
    setMenuOpen(false);
  }

  return (
    <div>
      <div
        className={'mapLayerHeader' + (selected ? '-selected' : '')}
        onClick={setSelectedState}
        onContextMenu={(e) => {
          setOffset({ left: e.clientX, top: e.clientY });
          setMenuOpen(true);
          e.preventDefault();
        }}
      >
        <Checkbox value={checked} onChange={onChecked} />
          {'  ' + subitem.text}
          <div className="mapLayerExpand">
            <button className="k-button k-button-clear" onClick={setExpandedState} title={t('map.layerVisibilityControl')}>
              <span className="k-icon k-i-gear" />
            </button>
          </div>
          <Popup
            offset={offset}
            show={menuOpen}
            onOpen={onPopupOpen}
            popupClass={'popup-content'}
          >
            <div
              onBlur={() => setMenuOpen(false)}
              ref={(el) => (menuWrapperRef.current = el)}
            >
              <Menu vertical={true} style={{ display: 'inline-block' }} onSelect={handleOnMenuSelect}>
                <MenuItem key="statistics" text={t('base.statistics')} />
              </Menu>
            </div>
          </Popup>
      </div>
      {expanded &&
        <div>
          <div className="mapLayerParam">
            <div className="mapLayerParamLabel">{t('map.minscale')}</div>
            <div>
              <Input
                className='mapLayerScaleEditor'
                ref={_lowScaleRef}
                value={lowScale}
                name="lowscale"
                onChange={(event) => {setLowScale(event.value)}}
              />
            </div>
          </div>
          <div className="mapLayerParam">
            <div className="mapLayerParamLabel">{t('map.maxscale')}</div>
            <div className="mapLayerParamValue">
              <Input
                className='mapLayerScaleEditor'
                ref={_highScaleRef}
                value={highScale === 'INF' ? t('base.infinity') : highScale}
                name="highscale"
                onChange={(event) => {setHighScale(event.value)}}
              />
                <Button className='mapLayerInfinityButton' onClick={setInfinity}>
                  {t('base.infinitySign')}
                </Button>
            </div>
          </div>
          <div className="mapLayerBottom">
            <Button className="mapLayerButtonRevert" onClick={revertScales} title={t('map.revertInitialValues')}>
              <span className="k-icon k-i-reset-sm" />
            </Button>
            <Button className="mapLayerButtonApply" onClick={applyScales}>
              {t('base.apply')}
            </Button>
          </div>
        </div>
      }
    </div>
  );
}
