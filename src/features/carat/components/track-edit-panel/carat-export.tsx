import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { inputNumberParser } from 'shared/locales';
import { closeWindow, showDialog } from 'entities/window';

import { Flex, Button, InputNumber } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { DialogProps } from '@progress/kendo-react-dialogs';
import { MenuSection, BigButton, ButtonSwitch } from 'shared/ui';

import './carat-export.scss';
import exportIcon from 'assets/images/carat/carat-export-png.svg';



interface CaratExportPanelProps {
  stage: ICaratStage;
}
interface CaratExportDialogProps {
  stage: ICaratStage;
  close: () => void;
}


export const CaratExportPanel = ({stage}: CaratExportPanelProps) => {
  const dispatch = useDispatch();
  const disabled = stage.getActiveTrack().constructionMode;

  const action = () => {
    const onClose = () => dispatch(closeWindow('carat-export'));
    const dialogProps: DialogProps = {title: 'Экспорт в PNG', width: 320, height: 170, onClose};
    const content = <CaratExportDialog stage={stage} close={onClose}/>;
    dispatch(showDialog('carat-export', dialogProps, content));
  };

  return (
    <MenuSection header={'Экспорт'} className={'big-buttons'}>
      <BigButton text={'Сохранить трек в PNG'} icon={exportIcon} action={action} disabled={disabled}/>
    </MenuSection>
  );
};

const CaratExportDialog = ({stage, close}: CaratExportDialogProps) => {
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
    const dataURL = canvas.toDataURL('image/png');
    close();

    const a = document.createElement('a');
    a.setAttribute('href', dataURL);
    a.setAttribute('download', 'carat.png');
    a.click();
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
