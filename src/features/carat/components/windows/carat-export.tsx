import { useState } from 'react';
import { Flex, Button, InputNumber } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { ButtonSwitch } from 'shared/ui';
import { saveFile } from 'shared/lib';
import { inputNumberParser } from 'shared/locales';
import { CaratStage } from '../../rendering/stage';
import './carat-export.scss';


interface CaratExportDialogProps {
  stage: CaratStage;
  close: () => void;
}


export const CaratExportDialog = ({stage, close}: CaratExportDialogProps) => {
  const viewport = stage.getActiveTrack().viewport;
  const [startDepth, setStartDepth] = useState(viewport.y);
  const [endDepth, setEndDepth] = useState(viewport.y + viewport.height);
  const [optionIndex, setOptionIndex] = useState(0);

  const onOptionChange = (index: number) => {
    if (index === 0) {
      setStartDepth(viewport.y);
      setEndDepth(viewport.y + viewport.height);
    }
    else if (index === 1) {
      setStartDepth(viewport.min);
      setEndDepth(viewport.max);
    }
    setOptionIndex(index);
  };

  const onSave = () => {
    const canvas = stage.renderImage({startDepth, endDepth});
    close();

    canvas.toBlob((data: Blob) => {
      if (data) saveFile('carat.png', data);
    }, 'image/png', 1);
  };

  return (
    <div className={'carat-export-dialog'}>
      <ButtonSwitch
        options={['Видимая часть', 'Весь трек', 'По глубине']}
        active={optionIndex} onChange={onOptionChange}
      />
      <Flex justify={'space-between'} align={'end'}>
        <div className={'carat-export-inputs'}>
          <span>От:</span>
          <InputNumber
            value={startDepth} min={0} max={endDepth} parser={inputNumberParser}
            precision={0} suffix={'м'} changeOnWheel={true}
            onChange={setStartDepth as any} disabled={optionIndex !== 2}
          />
          <span>До:</span>
          <InputNumber
            value={endDepth} min={startDepth} max={viewport.max} parser={inputNumberParser}
            precision={0} suffix={'м'} changeOnWheel={true}
            onChange={setEndDepth as any} disabled={optionIndex !== 2}
          />
        </div>
        <Button size={'middle'} icon={<DownloadOutlined/>} onClick={onSave}>Сохранить</Button>
      </Flex>
    </div>
  );
};
