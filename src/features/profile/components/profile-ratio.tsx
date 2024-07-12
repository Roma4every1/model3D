import { useState } from 'react';
import { InputNumber } from 'antd';
import { inputIntParser } from 'shared/locales';


export const ProfileRatio = ({parameters}: {parameters: ProfileParameters}) => {
  const [ratio, setRatio] = useState(parameters.ratio);

  const onChange = (value: number | null) => {
    setRatio(value);
    if (value !== null) parameters.ratio = value;
  };
  return (
    <InputNumber
      value={ratio} onChange={onChange} parser={inputIntParser}
      addonBefore={'Y/X:'} min={1} max={100} step={1}
    />
  );
};
