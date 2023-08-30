import { useState } from 'react';
import { MenuSection, BigButtonToggle } from 'shared/ui';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { constraints } from '../../lib/constants';
import xAxisGridIcon from 'assets/images/carat/x-axis-grid.svg';


interface XAxisSectionProps {
  stage: ICaratStage;
  group: ICaratColumnGroup;
}


export const XAxisSection = ({stage, group}: XAxisSectionProps) => {
  const settings = group?.xAxis;
  const { min: minMarks, max: maxMarks } = constraints.yAxisMarks;
  const idx = stage.getActiveTrack().getGroups().findIndex(g => g === group);

  const [showGrid, setShowGrid] = useState(settings.grid);
  const [marksCount, setMarksCount] = useState(settings.numberOfMarks);
  const [marksCountValid, setMarksCountValid] = useState(true);

  const onShowGridChange = () => {
    setShowGrid(!showGrid);
    settings.grid = !showGrid;
    stage.edit({type: 'group-x-axis', payload: {idx, settings}});
    stage.render();
  };

  const onMarksCountChange = ({value}: NumericTextBoxChangeEvent) => {
    if (Number.isInteger(value) && value >= minMarks && value <= maxMarks) {
      setMarksCount(value);
      setMarksCountValid(true);
      settings.numberOfMarks = value;
      stage.edit({type: 'group-x-axis', payload: {idx, settings}})
      stage.render();
    } else {
      setMarksCount(value);
      setMarksCountValid(false);
    }
  };

  return (
    <MenuSection header={'Шкала'} className={'big-buttons'} style={{gap: 4}}>
      <BigButtonToggle
        text={'Показать сетку'} icon={xAxisGridIcon}
        action={onShowGridChange} active={showGrid}
      />
      <div>
        <div>Делений:</div>
        <NumericTextBox
          style={{width: 100, height: 24}}
          min={minMarks} max={maxMarks} step={1} format={'#'}
          value={marksCount} valid={marksCountValid} onChange={onMarksCountChange}
        />
      </div>
    </MenuSection>
  );
};
