import { createElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'shared/lib';
import { channelSelector } from 'entities/channels';
import { fileViewStateSelector } from '../store/file-view.selectors';
import { updateFileViewModel } from '../store/file-view.thunks';

import './file-view.scss';
import { TextInfo } from 'shared/ui';
import { UnsupportedFile } from './unsupported-file.tsx';
import { fileViewDict } from './renderers';
import { supportedExtensions } from '../lib/constants.ts';


/** Форма просмотра файла. */
export const FileView = ({id, channels}: FormState) => {
  const dispatch = useDispatch();
  const { model }: FileViewState = useSelector(fileViewStateSelector.bind(id));

  const channel: Channel = useSelector(channelSelector.bind(channels[0]?.name));
  const data = channel?.data;

  useEffect(() => {
    dispatch(updateFileViewModel(id, data));
  }, [data, id, dispatch]);

  if (!model) {
    return <TextInfo text={'file-view.no-file'}/>;
  }
  if (!supportedExtensions.has(model.fileType)) {
    return <UnsupportedFile name={model.fileName} data={model.data}/>;
  }
  return createElement(fileViewDict[model.fileType], model);
};
