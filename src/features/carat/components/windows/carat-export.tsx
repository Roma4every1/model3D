import { useEffect, useState } from 'react';
import { Flex, Button, InputNumber, Select, Radio, RadioChangeEvent } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { ButtonSwitch } from 'shared/ui';
import { saveFile } from 'shared/lib';
import { inputNumberParser } from 'shared/locales';
import { CaratStage } from '../../rendering/stage';
import { caratExportInterval, caratExportModes } from '../../lib/constants';
import { caratToExcel } from 'features/carat/lib/excel-export';
import { CaratTrack } from 'features/carat/rendering/track';
import './carat-export.scss';


interface CaratExportDialogProps {
  stage: CaratStage;
  close: () => void;
  format: string;
}


export const CaratExportDialog = ({stage, close, format}: CaratExportDialogProps) => {
  const { y, height } = stage.getActiveTrack().viewport;
  const tracks = stage.trackList;
  const [startDepth, setStartDepth] = useState(y);
  const [endDepth, setEndDepth] = useState(y + height);
  const [optionIndex, setOptionIndex] = useState(0);
  const [optionInterval, setOptionInterval] = useState(0);
  const [prevInterval, setPrevInterval] = useState<number>(0);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [prevOptionIndex, setPrevOptionIndex] = useState(0);

  const trackViewports= stage.trackList.map(track => track.viewport);
  const trackInclinometry= stage.trackList.map(track => track.inclinometry);

  const minStartDepth = Math.min(...trackViewports.map(v => v.min));
  const maxEndDepth = Math.max(...trackViewports.map(v => v.max));
  const minStartAbs = Math.min(...trackInclinometry.map(i => i.getFirstData().absMark));
  const maxEndAbs = Math.max(...trackInclinometry.map(i => i.getAbsMark(maxEndDepth)));

  const options = [
    {label: 'Все треки', value: 0},
    ...tracks.map((track, index) => ({label: `${track.wellName}`, value: index + 1})),
  ];

  useEffect(() => {
    setPrevInterval(optionInterval);
    setPrevOptionIndex(prevOptionIndex);
}, [optionInterval, prevOptionIndex]);

  const calculateDepths = (index: number, track: CaratTrack | CaratTrack[], interval?: number) => {
    (Array.isArray(track)) ? handleAllTracks(track, index, interval) : handleTrack(index, track, interval);
  };

  const handleAllTracks = (track: CaratTrack[], index: number, interval?: number) => {
    switch(index) {
      case 0:
        setStartDepth(y);
        setEndDepth(y + height);
      break;
      case 1:
        setStartDepth(minStartDepth);
        setEndDepth(maxEndDepth);
      break;
      case 2:
        if (interval === 1) {
          calcAbs(track, startDepth, endDepth);
        } else {
          if (prevInterval === 1) {
            calcDepths(track, startDepth, endDepth);
          } else {
            setStartDepth(startDepth);
            setEndDepth(endDepth);
          }
        }
      break;
    }
  };

  const handleTrack = (index: number, track: CaratTrack, interval?: number) => {
    switch (index) {
      case 0:
        setStartDepth(track.viewport.y);
        setEndDepth(track.viewport.y + track.viewport.height);
      break;
      case 1:
        setStartDepth(track.viewport.min);
        setEndDepth(track.viewport.max);
      break;
      case 2:
        interval === 1 ? calcAbs(track, startDepth, endDepth) : calcDepths(track, startDepth, endDepth);
      break;
    }
  };

  const calcAbs = (track: CaratTrack | CaratTrack[], startDepth: number, endDepth: number) => {
    if (Array.isArray(track)) {
      const startAbs = track[0].inclinometry.getAbsMark(startDepth);
      const endAbs = track[0].inclinometry.getAbsMark(endDepth);
      if (prevInterval === 1 && prevOptionIndex === 2) {
        (startDepth <= minStartAbs && startDepth >= maxEndAbs) ? setStartDepth(startDepth) : setStartDepth(minStartAbs);
        (endDepth <= minStartAbs && endDepth >= maxEndAbs) ? setEndDepth(endDepth) : setEndDepth(maxEndAbs);
      } else {
        (startAbs <= minStartAbs && startAbs >= maxEndAbs) ? setStartDepth(startAbs) : setStartDepth(minStartAbs);
        (endAbs <= minStartAbs && endAbs >= maxEndAbs) ? setEndDepth(endAbs) : setEndDepth(maxEndAbs);
      }
    } else {
      const startAbs = track.inclinometry.getAbsMark(startDepth);
      const endAbs = track.inclinometry.getAbsMark(endDepth);
      const maxAbs = track.inclinometry.getFirstData().absMark;
      const minAbs = track.inclinometry.getAbsMark(track.viewport.max);

      if (prevInterval === 1 && prevOptionIndex === 2) {
        (startDepth <= maxAbs && startDepth >= minAbs) ? setStartDepth(startDepth) : setStartDepth(maxAbs);
        (endDepth <= maxAbs && endDepth >= minAbs) ? setEndDepth(endDepth) : setEndDepth(minAbs);
      } else {
        (startAbs >= minAbs &&  startAbs <= maxAbs) ? setStartDepth(startAbs) : setStartDepth(maxAbs);
        (endAbs >= minAbs && endAbs <= maxAbs) ? setEndDepth(endAbs) : setEndDepth(minAbs);
      }
    }
  };

  const calcDepths = (track: CaratTrack | CaratTrack[], startDepth: number, endDepth:number) => {
    if (Array.isArray(track)) {
      const start = track[0].inclinometry.getDepth(startDepth);
      const end = track[0].inclinometry.getDepth(endDepth);

      if (prevInterval === 1) {
        (start > minStartDepth && start < maxEndDepth) ? setStartDepth(start) : setStartDepth(minStartDepth);
        (end > minStartDepth && end < maxEndDepth) ? setEndDepth(end) : setEndDepth(maxEndDepth);
      }
    } else {
      const start = track.inclinometry.getDepth(startDepth);
      const end = track.inclinometry.getDepth(endDepth);
      const minDepth = track.viewport.min;
      const maxDepth = track.viewport.max;

      if (prevInterval === 1) {
        (start > minDepth && start < maxDepth) ? setStartDepth(start) : setStartDepth(minDepth);
        (end > minDepth && end < maxDepth) ? setEndDepth(end) : setEndDepth(maxDepth);

      } else {
        setStartDepth(startDepth);
        setEndDepth(endDepth);
      }
    }
  };

  const updateDepths = (index: number, trackIndex: number, interval?: number) => {
    if (trackIndex !== 0) {
      calculateDepths(index, tracks[trackIndex-1], interval);
    } else if (trackIndex === 0) {
      calculateDepths(index, tracks, interval);
    } else {
      calculateDepths(index, stage.getActiveTrack(), interval);
    }
  };

  const onTrackOptionChange = (trackIndex: number) => {
    setSelectedTrackIndex(trackIndex);
    updateDepths(optionIndex, trackIndex, optionInterval);
  };

  const onOptionChange = (index: number) => {
    setOptionIndex(index);
    setPrevOptionIndex(index);
    updateDepths(index, selectedTrackIndex, optionInterval);
  };

  const onIntervalChange = (e: RadioChangeEvent) => {
    setPrevInterval(optionInterval);
    setOptionInterval(e.target.value);
    updateDepths(optionIndex, selectedTrackIndex, e.target.value);
  };

  const startDepthTracks = () =>{
    if (selectedTrackIndex !== 0) {
      return optionInterval === 0 ? startDepth : tracks[selectedTrackIndex - 1].inclinometry.getDepth(startDepth);
    } else if (optionIndex === 0) {
      return (trackViewports.map(v => v.y));
    } else if (optionIndex === 1) {
      return minStartDepth;
    } else {
      if (tracks.length > 1) {
        return optionInterval === 0 ? startDepth : (trackInclinometry.map(i => i.getDepth(startDepth)));
      } else {
        return optionInterval === 0 ? endDepth : (stage.getActiveTrack().inclinometry.getDepth(startDepth));
      }
    }
  };

  const endDepthTracks = () =>{
    if (selectedTrackIndex !== 0) {
      return optionInterval === 0 ? endDepth : tracks[selectedTrackIndex - 1].inclinometry.getDepth(endDepth);
    } else if (optionIndex === 0) {
      return (trackViewports.map(v => v.y + v.height));
    } else if (optionIndex === 1) {
      return maxEndDepth;
    } else {
      if (tracks.length > 1) {
        return optionInterval === 0 ? endDepth : (trackInclinometry.map(i => i.getDepth(endDepth)));
      } else {
        return optionInterval === 0 ? endDepth : (stage.getActiveTrack().inclinometry.getDepth(endDepth));
      }
    }
  };

  const minValueDepth = selectedTrackIndex !== 0 ? tracks[selectedTrackIndex - 1].viewport.min : minStartDepth;
  const maxValueDepth = selectedTrackIndex !== 0  ? tracks[selectedTrackIndex - 1].viewport.max : maxEndDepth;

  const maxValueAbs = selectedTrackIndex !== 0 ? tracks[selectedTrackIndex - 1].inclinometry.getFirstData().absMark : minStartAbs;
  const minValueAbs = selectedTrackIndex !== 0  ? tracks[selectedTrackIndex - 1].inclinometry.getAbsMark(maxValueDepth) : maxEndAbs;

  const onSave = () => {
    const canvas = stage.renderImage({
      startDepth: startDepthTracks(),
      endDepth: endDepthTracks(),
      selectedTrack: selectedTrackIndex !== 0 ? [tracks[selectedTrackIndex - 1]] : tracks,
    });
    close();

    if (format === 'png') {
      canvas.toBlob((data: Blob) => {
        if (data) saveFile('carat.png', data);
      }, 'image/png', 1);
    } else if (format === 'excel') {
      const wellName = selectedTrackIndex !== 0 ? options[selectedTrackIndex].label : options[0].label;
      caratToExcel(canvas, wellName).then(file => saveFile('carat.xlsx', file)).catch();
    }
  };

  const handleStartDepthChange = (value: number) => {
    if (optionInterval === 0 ) {
      if (value <= endDepth && value >= minValueDepth) {
        setStartDepth(value);
      }
    } else {
      if (value <= maxValueAbs && value >= endDepth) {
        setStartDepth(value);
      }
    }
  };

  const handleEndDepthChange = (value: number) => {
    if(optionInterval === 0) {
      if (value >= startDepth && value <= maxValueDepth) {
        setEndDepth(value);
      }
    } else {
      if (value <= startDepth && value >= minValueAbs) {
        setEndDepth(value);
      }
    }
  };

  return (
    <div className={'carat-export-dialog'}>
      {tracks.length > 1 &&
        <Select value={selectedTrackIndex} options={options} onChange={onTrackOptionChange}/>
      }
      <ButtonSwitch options={caratExportModes} value={optionIndex} onChange={onOptionChange}/>
      {optionIndex === 2 &&
        <Flex vertical>
          <Radio.Group options={caratExportInterval} defaultValue={optionInterval} onChange={onIntervalChange}/>
        </Flex>
      }
      <Flex justify={'space-between'} align={'end'}>
        <div className={'carat-export-inputs'}>
          <span>От:</span>
          <InputNumber
            value={startDepth} min={optionInterval !== 1 || optionIndex !== 2 ? minValueDepth : minValueAbs}
            max={optionInterval !== 1 || optionIndex !== 2 ? maxValueDepth : maxValueAbs} parser={inputNumberParser}
            precision={0} suffix={'м'} changeOnWheel={true}
            onChange={handleStartDepthChange} disabled={optionIndex !== 2}
          />
          <span>До:</span>
          <InputNumber
            value={endDepth} min={optionInterval !== 1 || optionIndex !== 2 ? minValueDepth : minValueAbs}
            max={optionInterval !== 1 || optionIndex !== 2 ? maxValueDepth : maxValueAbs} parser={inputNumberParser}
            precision={0} suffix={'м'} changeOnWheel={true}
            onChange={handleEndDepthChange} disabled={optionIndex !== 2}
          />
        </div>
        <Button size={'middle'} icon={<DownloadOutlined/>} onClick={onSave}>Сохранить</Button>
      </Flex>
    </div>
  );
};
