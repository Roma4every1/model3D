import { useState } from 'react';
import { Flex, Button, InputNumber } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { ButtonSwitch } from 'shared/ui';
import { saveFile } from 'shared/lib';
import { inputNumberParser } from 'shared/locales';
import { CaratStage } from '../../rendering/stage';
import { caratExportModes } from '../../lib/constants';
import './carat-export.scss';


interface CaratExportDialogProps {
  stage: CaratStage;
  close: () => void;
}


export const CaratExportDialog = ({stage, close}: CaratExportDialogProps) => {
  const { y, height, min, max } = stage.getActiveTrack().viewport;
  const [startDepth, setStartDepth] = useState(y);
  const [endDepth, setEndDepth] = useState(y + height);
  const [optionIndex, setOptionIndex] = useState(0);

  const onOptionChange = (index: number) => {
    if (index === 0) {
      setStartDepth(y);
      setEndDepth(y + height);
    }
    else if (index === 1) {
      setStartDepth(min);
      setEndDepth(max);
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
      <ButtonSwitch options={caratExportModes} value={optionIndex} onChange={onOptionChange}/>
      <Flex justify={'space-between'} align={'end'}>
        <div className={'carat-export-inputs'}>
          <span>От:</span>
          <InputNumber
            value={startDepth} min={Math.min(0, min)} max={endDepth} parser={inputNumberParser}
            precision={0} suffix={'м'} changeOnWheel={true}
            onChange={setStartDepth as any} disabled={optionIndex !== 2}
          />
          <span>До:</span>
          <InputNumber
            value={endDepth} min={startDepth} max={max} parser={inputNumberParser}
            precision={0} suffix={'м'} changeOnWheel={true}
            onChange={setEndDepth as any} disabled={optionIndex !== 2}
          />
        </div>
        <Button size={'middle'} icon={<DownloadOutlined/>} onClick={onSave}>Сохранить</Button>
      </Flex>
    </div>
  );
};
