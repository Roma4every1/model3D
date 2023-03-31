import { useState, useEffect } from 'react';
import { TextBox, TextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { MenuSection } from 'shared/ui';


interface CaratActiveColumnPanelProps {
  column: CaratColumn,
  drawer: ICaratDrawer,
}


export const CaratActiveColumnPanel = ({column, drawer}: CaratActiveColumnPanelProps) => {
  const [label, setLabel] = useState('');
  const [width, setWidth] = useState(null);
  const [step, setStep] = useState(null);

  useEffect(() => {
    if (!column) return;
    const { label, width, step } = column.settings;
    setLabel(label); setWidth(width); setStep(step);
  }, [column]);

  const onLabelChange = (e: TextBoxChangeEvent) => {
    if (typeof e.value !== 'string') return;
    column.settings.label = e.value; drawer.render();
    setLabel(e.value);
  };

  const onWidthChange = (e: NumericTextBoxChangeEvent) => {
    if (!e.value) return;
    column.settings.width = e.value; drawer.render();
    setWidth(e.value);
  };

  const onStepChange = (e: NumericTextBoxChangeEvent) => {
    if (!e.value) return;
    column.settings.step = e.value; drawer.render();
    setStep(e.value);
  };

  return (
    <MenuSection header={'Настройки активной колонки'} className={'carat-active-column'}>
      <div>
        <span>Имя:</span>
        <TextBox value={label} onChange={onLabelChange} spellCheck={false}/>
      </div>
      <div>
        <span>Ширина:</span>
        <NumericTextBox value={width} onChange={onWidthChange} step={1} min={1}/>
      </div>
      <div>
        <span>Шаг:</span>
        <NumericTextBox value={step} onChange={onStepChange} step={1} min={1}/>
      </div>
    </MenuSection>
  );
};
