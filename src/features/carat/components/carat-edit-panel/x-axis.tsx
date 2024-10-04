import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuSection, BigButtonToggle } from 'shared/ui';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';

import { CaratStage } from '../../rendering/stage';
import { constraints } from '../../lib/constants';
import xAxisGridIcon from 'assets/carat/x-axis-grid.svg';


interface XAxisSectionProps {
  stage: CaratStage;
}


export const XAxisSection = ({stage}: XAxisSectionProps) => {
  const { t } = useTranslation();
  const { min: minMarks, max: maxMarks } = constraints.yAxisMarks;

  const groups = stage.getActiveTrack().getGroups();
  const idx = groups.findIndex(g => g.hasCurveColumn());
  const settings = groups[idx]?.xAxis;

  const [showGrid, setShowGrid] = useState(settings?.grid);
  const [marksCount, setMarksCount] = useState(settings?.numberOfMarks);
  const [marksCountValid, setMarksCountValid] = useState(true);

  const onShowGridChange = () => {
    setShowGrid(!showGrid);
    settings.grid = !showGrid;
    stage.setGroupXAxis(idx, settings);
    stage.render();
  };

  const onMarksCountChange = ({value}: NumericTextBoxChangeEvent) => {
    if (Number.isInteger(value) && value >= minMarks && value <= maxMarks) {
      setMarksCount(value);
      setMarksCountValid(true);
      settings.numberOfMarks = value;
      stage.setGroupXAxis(idx, settings);
      stage.render();
    } else {
      setMarksCount(value);
      setMarksCountValid(false);
    }
  };

  return (
    <MenuSection header={t('carat.x-axis.header')} className={'big-buttons'} style={{gap: 4}}>
      <BigButtonToggle
        text={t('carat.x-axis.show-grid')} icon={xAxisGridIcon} active={showGrid}
        onClick={onShowGridChange} disabled={!settings}
      />
      <div>
        <div>{t('carat.x-axis.marks-count')}</div>
        <NumericTextBox
          style={{width: 100, height: 24}}
          min={minMarks} max={maxMarks} step={1} format={'#'} disabled={!settings}
          value={marksCount} valid={marksCountValid} onChange={onMarksCountChange}
        />
      </div>
    </MenuSection>
  );
};
